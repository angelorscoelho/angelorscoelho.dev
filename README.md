# angelorscoelho.dev

Personal portfolio website for **Ângelo Coelho**, a Senior Backend Software Engineer. The site showcases professional experience, projects, certifications, and a fully automated resume delivery pipeline — and is itself a demonstration of the engineering skills it describes.

Live at: **[angelorscoelho.dev](https://angelorscoelho.dev)**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript 5.7 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS (CDN) + custom CSS |
| Deployment | Vercel (serverless functions + CDN) |
| AI integration | Google Gemini API (`/api/chat` serverless function) |
| Image processing | Sharp (responsive WebP generation) |
| Resume pipeline | GitHub Actions + LaTeX (XeLaTeX) + git submodules |

---

## Project Structure

```
/
├── index.html              # HTML entry point (Tailwind CDN, Google Fonts)
├── index.tsx               # React DOM root
├── App.tsx                 # Root component and layout
├── constants.ts            # All resume data + Gemini system prompt
├── types.ts                # TypeScript interfaces (Job, Project, Certification, …)
├── metadata.json           # Page name and description
├── vite.config.ts          # Vite build config (asset naming, resume SHA injection)
├── vercel.json             # Serverless function config + SPA rewrite rules
├── generate-images.js      # Generates responsive WebP profile image variants
│
├── components/
│   ├── CodeBackground.tsx  # Full-screen canvas animated code background
│   ├── ExperienceCard.tsx  # Job card with spotlight hover effect
│   ├── ProjectCard.tsx     # Project card with spotlight hover effect
│   ├── CertificationCard.tsx # Certification with optional link
│   ├── SpotlightCard.tsx   # Generic spotlight-effect card wrapper
│   ├── ProfileImageModal.tsx # Responsive avatar + full-res modal
│   ├── AutomationDiagram.tsx # Workflow diagram: resume → portfolio → Vercel
│   ├── ChatBot.tsx         # Floating AI chatbot widget
│   ├── MarkdownRenderer.tsx # Markdown → React (for chatbot responses)
│   └── Icon.tsx            # SVG icon components
│
├── services/
│   └── geminiService.ts    # fetch wrapper for /api/chat
│
├── utils/
│   ├── useSpotlight.ts     # Cursor-tracking hook for spotlight effects
│   └── codeSnippets.ts     # SQL, C#, TypeScript code samples for the background
│
├── api/
│   └── chat.ts             # Vercel serverless function: Gemini chat backend
│
├── scripts/
│   ├── build-resume.js     # Orchestrates PDF acquisition + resume-meta.json
│   └── list-models.js      # Utility: list available Gemini models
│
├── src/assets/
│   ├── resume.pdf          # Latest built resume PDF
│   ├── resume-meta.json    # Traceability metadata (commit SHAs, timestamps)
│   └── profile_photo.*     # Source PNG + generated WebP variants (600w/1200w/2400w)
│
└── .github/workflows/
    └── build_resume.yml    # CI: pull updated PDF from resume repo and redeploy
```

---

## Key Features

### Animated Code Background

`CodeBackground.tsx` renders a full-screen HTML canvas with scrolling, syntax-highlighted code. On desktop it shows three columns (SQL, C#, TypeScript); on mobile, one column (TypeScript). A custom regex-based tokenizer classifies each token (keyword, string, comment, type, number, operator) and renders it in VS Code dark-theme colours at 10% opacity. The canvas rebuilds responsively on resize with 100 ms debouncing.

### Spotlight Hover Effect

`useSpotlight.ts` is a custom React hook that tracks the global cursor position via `pointermove`, `touchmove`, and `scroll` events. It writes the coordinates to CSS custom properties (`--mouse-x`, `--mouse-y`) on the hovered element. Cards read those properties to display a radial-gradient spotlight that follows the cursor in real time, with a teal-tinted border highlight. The same hook powers `ExperienceCard`, `ProjectCard`, `CertificationCard`, `SpotlightCard`, and the automation diagram nodes.

### AI Chatbot

`ChatBot.tsx` is a floating chat widget (bottom-right) backed by a Vercel serverless function at `/api/chat`. Key details:

- **Teaser messages** rotate every 8 seconds before the chat is opened.
- **Suggested questions** are shown until the user has sent 3 messages.
- **Markdown rendering** (`MarkdownRenderer.tsx`) formats model responses with headers, lists, and bold text.
- **Responsive**: full-screen overlay on mobile, 384 px panel on desktop.
- **Model fallback**: the backend tries `gemini-2.5-flash`, then progressively older models, to survive quota or availability issues. Rate-limit errors (HTTP 429) return a friendly message that suggests direct email contact.
- The Google Gemini API key is server-side only and never sent to the browser.

### Responsive Profile Image

`ProfileImageModal.tsx` loads a 176 px circular avatar from the small (600 w) WebP variant. After the initial render, `requestIdleCallback` (with a 2 s timeout fallback) pre-caches the 2400 w variant in the background. Clicking the avatar opens a portal-based modal (backdrop blur, fade + scale animation) that displays the full-resolution image.

### Automation Diagram

`AutomationDiagram.tsx` renders an interactive diagram of the resume build pipeline — three nodes (Resume repo, Portfolio repo, Vercel), directional arrows with labels, live GitHub Actions CI badge images, and a traceability callout that displays the current resume commit SHA and links to the exact commit on GitHub. Layout is a triangle on desktop and a vertical stack on mobile.

---

## Automated Resume Pipeline

The resume is authored in LaTeX in a separate repository. Any push to that repo triggers a fully automated chain:

```
LaTeX source (resume repo)
  └─ GitHub Actions: XeLaTeX build → commit PDF → workflow_dispatch to portfolio repo
       └─ GitHub Actions: copy PDF + write resume-meta.json → git push → main
            └─ Vercel: detect push → build + deploy
```

**Traceability** is maintained via `src/assets/resume-meta.json`, which records the full and short commit SHAs of both the resume repo HEAD and the original human commit that triggered the build. The PDF is served at a SHA-suffixed URL (e.g. `/assets/angelorscoelho_resume_abc12345.pdf`) so every deployed version is uniquely addressable.

`scripts/build-resume.js` resolves the PDF at build time from (in priority order):
1. The `./resume` git submodule.
2. The `RESUME_SRC` environment variable.
3. A fresh clone from GitHub (fallback for local development without the submodule).

On Vercel, where a TeX toolchain is unavailable, the script uses the pre-built PDF committed by the CI workflow. Locally, if TeX tools are present, it can compile the PDF from source.

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm

### Install & run

```bash
npm install
npm run dev          # Vite dev server at http://localhost:5173
```

### Build

```bash
npm run build        # Runs: generate-images → update:resume → build:resume → tsc → vite build
```

The `prebuild` sequence:
1. **`generate-images`** — generates responsive WebP variants from `src/assets/profile_photo.png` using Sharp.
2. **`update:resume`** — updates the `resume` git submodule.
3. **`build:resume`** — runs `scripts/build-resume.js` to resolve the PDF and write `resume-meta.json`.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (production) | Google Gemini API key for the `/api/chat` endpoint |
| `RESUME_SRC` | No | Absolute path to a local resume directory (overrides submodule) |
| `RESUME_REPO_PAT` | No (CI only) | GitHub PAT for cloning the private resume repo |

---

## Deployment

The site is deployed to Vercel. `vercel.json` configures:

- **API functions** — `maxDuration: 30 s`, region `iad1`.
- **SPA fallback** — all non-API routes rewrite to `index.html`.

Every push to `main` triggers an automatic Vercel deployment. The resume pipeline's final step is also a push to `main`, so updating the resume PDF results in a full site redeploy with no manual intervention.

---

## Resume Integration Details

See [`RESUME_INTEGRATION.md`](RESUME_INTEGRATION.md) for a full description of the resume build pipeline, submodule setup, and CI/CD workflow.
