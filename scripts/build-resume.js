import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

function exists(p) { return fs.existsSync(p); }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixedRoot = path.resolve(__dirname, '..');

const repoUrl = 'https://github.com/angelorscoelho/resume.git';
const submoduleDir = path.join(fixedRoot, 'resume');
const envSrc = process.env.RESUME_SRC;

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
    console.error('Failed to clone resume repo. Set RESUME_SRC to a local path or add the repo as a submodule at ./resume.');
    process.exit(2);
  }
  if (exists(tmpCloneDir)) {
    srcDir = tmpCloneDir;
    clonedTemp = true;
    console.log('Cloned resume repo to temporary directory: ' + srcDir);
  } else {
    console.error('Cloning finished but temporary folder not found: ' + tmpCloneDir);
    process.exit(2);
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
  // If a prebuilt PDF exists in the resume source, use it (useful for Vercel/CI where TeX may not be installed)
  const prebuilt = findNewestPdf(srcDir);
  const destDir = path.join(fixedRoot, 'src', 'assets');
  if (prebuilt) {
    if (!exists(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const dest = path.join(destDir, 'resume.pdf');
    fs.copyFileSync(prebuilt, dest);
    console.log('Found prebuilt PDF in resume repo; copied to', dest);
    if (clonedTemp) fs.rmSync(srcDir, { recursive: true, force: true });
    return;
  }

  // Try to build from source — attempt make, latexmk, pdflatex in order
  let built = false;

  // If Makefile is present, try make first
  if (exists(path.join(srcDir, 'Makefile')) || exists(path.join(srcDir, 'makefile'))) {
    console.log('Makefile found — trying `make`');
    const r = runCmd('make', [], srcDir);
    built = r.ok;
    if (!built) console.log('make failed or not available — trying other methods');
  }

  if (!built) {
    const mainTex = findMainTex(srcDir);
    if (!mainTex) {
      console.error('No .tex file found in resume source: ' + srcDir);
      process.exit(3);
    }
    // Try latexmk first
    let r = runCmd('latexmk', ['-pdf', '-interaction=nonstopmode', mainTex], srcDir);
    if (r.ok) {
      built = true;
    } else {
      console.log('latexmk failed or not available — falling back to pdflatex');
      r = runCmd('pdflatex', ['-interaction=nonstopmode', mainTex], srcDir);
      if (r.ok) {
        const r2 = runCmd('pdflatex', ['-interaction=nonstopmode', mainTex], srcDir);
        built = r2.ok;
      }
    }
  }

  // Try Docker as last resort
  if (!built) {
    const mainTex = findMainTex(srcDir) || 'main.tex';
    console.log('Trying Docker-based LaTeX build...');
    const volume = srcDir.replace(/\\/g, '/');
    const r = runCmd('docker', [
      'run', '--rm',
      '-v', volume + ':/workspace',
      '-w', '/workspace',
      'texlive/texlive',
      'latexmk', '-pdf', '-interaction=nonstopmode', mainTex
    ], srcDir);
    built = r.ok;
    if (!built) console.log('Docker build also failed or Docker not available');
  }

  if (!built) {
    console.error('No prebuilt PDF found and all LaTeX build methods failed.');
    console.error('Options: 1) Run the GitHub Actions workflow to build & push a PDF to the resume repo');
    console.error('         2) Install a TeX toolchain (latexmk/pdflatex) locally');
    console.error('         3) Install Docker and retry (uses texlive/texlive image)');
    process.exit(4);
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
