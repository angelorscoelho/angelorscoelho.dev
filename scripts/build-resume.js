import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

function exists(p) { return fs.existsSync(p); }

function toolExists(name) {
  // run `command -v name` to detect POSIX binaries; return false if not found
  const r = spawnSync('command', ['-v', name], { stdio: 'ignore', shell: false });
  return r.status === 0;
}

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// On Windows the pathname may start with a leading slash, remove on drive-letter paths
let fixedRoot = projectRoot;
if (process.platform === 'win32' && fixedRoot.startsWith('/')) fixedRoot = fixedRoot.slice(1);

const repoUrl = 'https://github.com/angelorscoelho/resume.git';
const submoduleDir = path.join(fixedRoot, 'resume');
const envSrc = process.env.RESUME_SRC;

// if user has already committed a PDF under src/assets, nothing else is required
const embeddedPdf = path.join(fixedRoot, 'src', 'assets', 'resume.pdf');
if (exists(embeddedPdf)) {
  console.log('Embedded resume PDF found; skipping resume build.');
  process.exit(0);
}

const tmpBase = os.tmpdir();
const tmpCloneDir = path.join(tmpBase, 'resume-clone-' + Date.now());

let srcDir = null;
let clonedTemp = false;
if (exists(submoduleDir)) {
  srcDir = submoduleDir;
  console.log('Using resume directory: ' + srcDir + ' (project subfolder)');
} else if (envSrc && exists(envSrc)) {
  srcDir = envSrc;
  console.log('Using resume directory from RESUME_SRC: ' + srcDir);
} else {
  // Try to clone the resume repository into a temp directory (works on CI / Vercel)
  console.log('No local resume source found. Attempting to clone ' + repoUrl + ' into temporary directory.');
  const r = spawnSync('git', ['clone', '--depth', '1', repoUrl, tmpCloneDir], { cwd: fixedRoot, stdio: 'inherit' });
  if (r.error || r.status !== 0) {
    console.warn('Could not clone resume repo; continuing without resume source.');
    console.warn('Set RESUME_SRC to a local path or add the repo as a submodule at ./resume if you need to build.');
    // leave srcDir null, build() will simply skip operations
  } else if (exists(tmpCloneDir)) {
    srcDir = tmpCloneDir;
    clonedTemp = true;
    console.log('Cloned resume repo to temporary directory: ' + srcDir);
  } else {
    console.warn('Cloning finished but temporary folder not found: ' + tmpCloneDir);
    // still continue without a source
  }
}

function findMainTex(dir) {
  const names = ['resume.tex', 'main.tex', 'cv.tex', 'index.tex'];
  for (const n of names) if (exists(path.join(dir, n))) return n;
  const files = fs.readdirSync(dir);
  for (const f of files) if (f.endsWith('.tex')) return f;
  return null;
}

function runCmd(cmd, args, cwd) {
  console.log('> ' + cmd + ' ' + args.join(' '));
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: false });
  if (res.error) {
    console.error('Failed to run', cmd, res.error.message || res.error);
    return { ok: false, code: res.status };
  }
  return { ok: res.status === 0, code: res.status };
}

function findNewestPdf(folder) {
  let best = null;
  function walk(d) {
    const items = fs.readdirSync(d, { withFileTypes: true });
    for (const it of items) {
      const p = path.join(d, it.name);
      if (it.isDirectory()) {
        if (d === folder) walk(p); // only one level deep
      } else if (it.isFile() && it.name.toLowerCase().endsWith('.pdf')) {
        const st = fs.statSync(p);
        if (!best || st.mtime > best.mtime) best = { path: p, mtime: st.mtime };
      }
    }
  }
  walk(folder);
  return best ? best.path : null;
}

async function build() {
  const destDir = path.join(fixedRoot, 'src', 'assets');
  const assetPdf = path.join(destDir, 'resume.pdf');

  // if we already placed the PDF in assets earlier or checked it in, nothing
  // further needs to happen (this duplicate check is minor but keeps
  // behaviour consistent when build() is called directly).
  if (exists(assetPdf)) {
    console.log('resume.pdf already exists in assets; skipping resume build.');
    return;
  }

  // if we never obtained a source directory (clone failure or no env/submodule)
  if (!srcDir) {
    console.log('No resume source available; skipping resume build.');
    return;
  }

  // copy any prebuilt PDF that may already exist in the source directory
  const prebuilt = findNewestPdf(srcDir);
  if (prebuilt) {
    if (!exists(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const dest = path.join(destDir, 'resume.pdf');
    fs.copyFileSync(prebuilt, dest);
    console.log('Found prebuilt PDF in resume source; copied to', dest);
    if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
    return;
  }

  // if we reach here, there is no prebuilt PDF; attempt compilation only if tools exist
  if (exists(path.join(srcDir, 'Makefile')) || exists(path.join(srcDir, 'makefile'))) {
    if (!toolExists('make')) {
      console.warn('Makefile present but `make` is not available; skipping resume build.');
      if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
      return;
    }
    console.log('Makefile found — running `make`');
    const r = runCmd('make', [], srcDir);
    if (!r.ok) {
      console.warn('`make` failed; resume PDF will not be produced (continuing).');
      if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
      return;
    }
  } else {
    const mainTex = findMainTex(srcDir);
    if (!mainTex) {
      console.error('No .tex file found in resume source: ' + srcDir);
      if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
      return;
    }

    if (!toolExists('latexmk') && !toolExists('pdflatex')) {
      console.warn('No LaTeX tools (latexmk or pdflatex) available; skipping compile.');
      if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
      return;
    }

    // Try latexmk first if available
    let ok = false;
    if (toolExists('latexmk')) {
      const r = runCmd('latexmk', ['-pdf', '-interaction=nonstopmode', mainTex], srcDir);
      if (r.ok) ok = true;
    }
    if (!ok && toolExists('pdflatex')) {
      console.log('latexmk not successful; using pdflatex fallback (twice)');
      let r = runCmd('pdflatex', ['-interaction=nonstopmode', mainTex], srcDir);
      if (r.ok) {
        const r2 = runCmd('pdflatex', ['-interaction=nonstopmode', mainTex], srcDir);
        built = r2.ok;
      }
    }

    if (!ok) {
      console.warn('LaTeX compilation failed (or tools unavailable).  Resume PDF will not be generated.');
      if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
      return;
    }
  }

  const pdfPath = findNewestPdf(srcDir);
  if (!pdfPath) {
    console.error('Build finished but no PDF found in ' + srcDir);
    process.exit(5);
  }
  if (!exists(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, 'resume.pdf');
  fs.copyFileSync(pdfPath, dest);
  console.log('Copied generated PDF to', dest);
  if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
}

build().catch(err => {
  console.error('Unexpected error building resume:', err && err.stack ? err.stack : err);
  process.exit(99);
});
