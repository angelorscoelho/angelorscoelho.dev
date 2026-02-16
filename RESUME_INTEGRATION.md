Resume build integration
------------------------

This project includes a helper to produce or fetch your resume PDF and place it at `src/assets/resume.pdf`.

How it works
- The script `scripts/build-resume.js` will use the resume sources in this order:
  1. `./resume` (recommended: add the resume repo as a submodule here)
  2. the path set in the environment variable `RESUME_SRC`
  3. clone `https://github.com/angelorscoelho/resume.git` into a temporary folder (useful on CI/Vercel)

- If a prebuilt PDF is present in the resume repository the script will copy it directly (this is the recommended approach for Vercel where a TeX toolchain may not be available).
- If no PDF is present, the script attempts to build the PDF using `Makefile`/`latexmk`/`pdflatex`.
- After success it copies the produced PDF to `src/assets/resume.pdf`.

Usage
- Build only the resume:
```
npm run build:resume
```

- If your resume repo is elsewhere, point to it with environment variable:
PowerShell:
```
$env:RESUME_SRC = 'C:\\path\\to\\resume'
npm run build:resume
```
cmd.exe:
```
set RESUME_SRC=C:\\path\\to\\resume && npm run build:resume
```

Integrating into your portfolio build
 - The `prebuild` script was updated to run `npm run build:resume`, so `npm run build` will also rebuild or fetch your resume automatically.

- The `prebuild` script now updates the `resume` submodule (if present) before building. Use `npm run update:resume` or let `npm run build` call it automatically.

CI automation (GitHub Actions)
- This repo includes a workflow `.github/workflows/build_resume.yml` which can build the resume and push the produced `resume.pdf` back to the `angelorscoelho/resume` repository.
- To enable the workflow to push changes, add a repository secret named `RESUME_REPO_PAT` containing a Personal Access Token (classic) with `repo` scope for `angelorscoelho/resume`.
- You can run the workflow manually (Actions → Build and push resume PDF) or call it from other workflows; when the secret is set the action will clone the resume repo, install a TeX toolchain, build, then commit and push `resume.pdf` back to the resume repo's `main` branch.

Security note
- Store the PAT in the repository secrets only. If you prefer, you can configure the action to push to a specific branch or create a PR instead of pushing directly — tell me your preference and I'll adjust the workflow.

Adding the resume repository as a git submodule (recommended)
In your portfolio repo root run (recommended):
```
git submodule add https://github.com/angelorscoelho/resume.git resume
git submodule update --init --remote
```
- This will place the resume sources in `./resume` and the build script will use it automatically.

Requirements
Requirements
- For automatic builds that compile from LaTeX you need a TeX toolchain accessible in PATH (latexmk or pdflatex). On Windows install MikTeX or TeX Live and make sure commands are available.
- On Vercel and many CI systems where TeX is not available, include a prebuilt `resume.pdf` in the resume repo or provide a binary artifact; the script will copy that PDF instead of trying to compile.

If you want, I can add a helper `git` workflow or an npm task that updates the submodule automatically — tell me which option you prefer.
