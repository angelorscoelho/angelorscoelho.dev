import React, { useRef } from 'react';
import { GitHubIcon, ExternalLinkIcon, VercelIcon } from './Icon';
import resumeMeta from '../src/assets/resume-meta.json';
import { useSpotlight } from '../utils/useSpotlight';

const { sourceSha, sourceShaShort } = resumeMeta as Record<string, string>;

/* ─── Shared icon helpers ──────────────────────────────────────────────────── */

const ArrowDown = () => (
  <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="mx-auto">
    <line x1="6" y1="0" x2="6" y2="16" stroke="rgb(94 234 212 / 0.35)" strokeWidth="1.5" />
    <path d="M2 14L6 19L10 14" stroke="rgb(94 234 212 / 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = () => (
  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="mx-auto">
    <line x1="0" y1="6" x2="20" y2="6" stroke="rgb(94 234 212 / 0.35)" strokeWidth="1.5" />
    <path d="M18 2L23 6L18 10" stroke="rgb(94 234 212 / 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Link button ──────────────────────────────────────────────────────────── */

const LinkButton: React.FC<{ href: string; label: string; icon: React.ReactNode }> = ({ href, label, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/60 bg-slate-900/50 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-teal-300 hover:border-teal-400/40 transition-colors"
  >
    {icon}
    {label}
    <ExternalLinkIcon className="w-3 h-3 opacity-50" />
  </a>
);

/* ─── Node card ────────────────────────────────────────────────────────────── */

interface NodeProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  badges: string[];
  trigger: string;
  statusBadgeUrl?: string;
  links: { href: string; label: string; icon: React.ReactNode }[];
}

const NodeCard: React.FC<NodeProps> = ({ icon, title, subtitle, description, badges, trigger, statusBadgeUrl, links }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useSpotlight(cardRef);

  return (
    <div ref={cardRef} className="group relative rounded-xl border border-slate-700/80 bg-slate-800/50 p-5 hover:border-teal-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/10">
      {/* Spotlight background */}
      <div 
        className="absolute -inset-px z-0 rounded-xl transition-opacity duration-300 opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(94, 234, 212, 0.1), transparent 40%)`
        }}
      ></div>

      {/* Header row */}
      <div className="relative z-10 flex items-center gap-3 mb-3">
        <span className="text-teal-400 shrink-0">{icon}</span>
        <div className="min-w-0">
          <h3 className="text-slate-200 font-semibold text-sm leading-tight">{title}</h3>
          <p className="text-[11px] text-slate-500 font-mono leading-tight mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 text-slate-400 text-[13px] leading-relaxed mb-3">{description}</p>

      {/* Trigger pill */}
      <div className="relative z-10 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/60 bg-slate-900/60 px-2 py-0.5 text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0"></span>
          {trigger}
        </span>
      </div>

      {/* Tech badges */}
      <div className="relative z-10 flex flex-wrap gap-1.5 mb-4">
        {badges.map((b) => (
          <span key={b} className="rounded-full bg-teal-400/10 px-2.5 py-0.5 text-[10px] font-medium leading-4 text-teal-300">
            {b}
          </span>
        ))}
      </div>

      {/* Explicit links */}
      <div className="relative z-10 flex flex-wrap gap-2 mb-3">
        {links.map((l) => (
          <LinkButton key={l.href} {...l} />
        ))}
      </div>

      {/* CI badge */}
      {statusBadgeUrl && (
        <a
          href={statusBadgeUrl.endsWith('/badge.svg') ? statusBadgeUrl.slice(0, -'/badge.svg'.length) : statusBadgeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View workflow runs on GitHub Actions"
        >
          <img src={statusBadgeUrl} alt="CI status" className="relative z-10 h-5 rounded mt-1" loading="lazy" />
        </a>
      )}
    </div>
  );
};

/* ─── Arrow label (between nodes) ──────────────────────────────────────────── */

const ArrowLabel: React.FC<{ label: string; sublabel: string; direction: 'down' | 'right' }> = ({ label, sublabel, direction }) => (
  <div className={`flex ${direction === 'down' ? 'flex-col items-center py-2' : 'flex-row items-center px-2'}`}>
    {direction === 'down' && <ArrowDown />}
    <div className={`text-center ${direction === 'right' ? 'mx-1' : 'my-0.5'}`}>
      <span className="block text-[10px] font-mono text-teal-400 leading-tight">{label}</span>
      <span className="block text-[10px] font-mono text-slate-500 leading-tight">{sublabel}</span>
    </div>
    {direction === 'down' && <ArrowDown />}
    {direction === 'right' && <ArrowRight />}
  </div>
);

/* ─── Main diagram ─────────────────────────────────────────────────────────── */

export const AutomationDiagram: React.FC = () => (
  <div>
    {/* ── Section header ── */}
    <h3 className="text-slate-200 text-lg mb-2">
      Think I update things manually? <span className="text-slate-200">Think again.</span>
    </h3>
    <p className="text-slate-400 text-sm leading-relaxed mb-8">
      Every piece of this website is wired to deploy itself. I edit a LaTeX file in my résumé repo, and within minutes
      a fresh PDF lands here and the site is live — zero clicks, zero copy-paste.
      Want proof? The badges below are live from GitHub Actions. Go ahead, check the workflow history.
    </p>

    {/* ── Triangle layout ──
         Desktop (md+): top card centered, two bottom cards side-by-side
         Mobile: vertical stack — Resume → Portfolio → Vercel
    */}
    <div className="space-y-0">

      {/* Top: Resume repo (full width) */}
      <NodeCard
        icon={<GitHubIcon className="w-5 h-5" />}
        title="Resume Repository"
        subtitle="angelorscoelho/resume"
        description="LaTeX source compiled with XeLaTeX, compressed by Ghostscript. Every push to main builds a fresh résumé PDF, commits it back, then calls the portfolio's workflow via the GitHub REST API."
        badges={['LaTeX', 'XeLaTeX', 'Ghostscript', 'GitHub Actions']}
        trigger="on: push → main"
        statusBadgeUrl="https://github.com/angelorscoelho/resume/actions/workflows/build-and-publish-resume.yml/badge.svg"
        links={[
          { href: 'https://github.com/angelorscoelho/resume', label: 'Source code', icon: <GitHubIcon className="w-3.5 h-3.5" /> },
          { href: 'https://github.com/angelorscoelho/resume/actions/workflows/build-and-publish-resume.yml', label: 'Workflow runs', icon: <GitHubIcon className="w-3.5 h-3.5" /> },
        ]}
      />

      {/* Arrow: Resume → Portfolio */}
      <ArrowLabel label="workflow_dispatch" sublabel="via GitHub REST API" direction="down" />

      {/* Bottom row on md+, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Bottom-left: Portfolio repo */}
        <NodeCard
          icon={<GitHubIcon className="w-5 h-5" />}
          title="Portfolio Repository"
          subtitle="angelorscoelho/angelorscoelho.dev"
          description="React + Vite site. Receives the dispatched workflow, clones the résumé repo, copies the newly built PDF into assets, commits, and pushes — which triggers Vercel."
          badges={['React', 'TypeScript', 'Vite', 'GitHub Actions']}
          trigger="on: workflow_dispatch"
          statusBadgeUrl="https://github.com/angelorscoelho/angelorscoelho.dev/actions/workflows/build_resume.yml/badge.svg"
          links={[
            { href: 'https://github.com/angelorscoelho/angelorscoelho.dev', label: 'Source code', icon: <GitHubIcon className="w-3.5 h-3.5" /> },
            { href: 'https://github.com/angelorscoelho/angelorscoelho.dev/actions/workflows/build_resume.yml', label: 'Workflow runs', icon: <GitHubIcon className="w-3.5 h-3.5" /> },
          ]}
        />

        {/* Arrow between bottom cards — visible only on mobile */}
        <div className="flex md:hidden flex-col items-center -my-2">
          <ArrowLabel label="git push → main" sublabel="triggers Vercel" direction="down" />
        </div>

        {/* Bottom-right: Vercel */}
        <NodeCard
          icon={<VercelIcon className="w-5 h-5" />}
          title="Vercel (Production)"
          subtitle="angelorscoelho.dev"
          description="Zero-config serverless deployment. GitHub integration auto-detects every push to main and builds the Vite app for global CDN distribution — no vercel.json required."
          badges={['Vite', 'Serverless', 'CDN', 'Edge Network']}
          trigger="on: git push → main"
          links={[
            { href: 'https://angelorscoelho.dev', label: 'Live site', icon: <VercelIcon className="w-3.5 h-3.5" /> },
          ]}
        />
      </div>

      {/* Arrow label between bottom cards — visible only on md+ */}
      <div className="hidden md:flex items-center justify-center -mt-1 mb-2">
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
          <span className="text-teal-400">git push → main</span>
          <span>•</span>
          <span>triggers Vercel via GitHub integration</span>
        </div>
      </div>
    </div>

    {/* ── Traceability callout ── */}
    <div className="mt-8 rounded-xl border border-teal-400/20 bg-teal-400/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-teal-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <div className="min-w-0 w-full">
          <h4 className="text-slate-200 text-sm font-semibold mb-1.5">Full version traceability</h4>
          <p className="text-slate-400 text-[13px] leading-relaxed mb-2">
            Every résumé PDF is built from a specific commit in the resume repo. The SHA of that commit is captured by the GitHub Actions workflow and written to a metadata file committed alongside the PDF — so every deployed version is fully traceable end to end.
          </p>

          {/* Live SHA display */}
          <div className="mb-3 rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-3">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Current live PDF — built from commit</p>
            {resumeMeta.shaShort === '0000000' ? (
              <p className="text-[12px] font-mono text-slate-500 italic">SHA not available — local build</p>
            ) : (
              <a
                href={resumeMeta.resumeCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 font-mono text-sm text-teal-300 hover:text-teal-200 transition-colors"
              >
                <span className="text-slate-500">#</span>
                <span className="font-semibold tracking-tight">…{resumeMeta.shaShort}</span>
                <ExternalLinkIcon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
            {resumeMeta.builtAt !== 'local-build' && (
              <p className="text-[10px] font-mono text-slate-600 mt-1">built at {resumeMeta.builtAt}</p>
            )}
          </div>

          <p className="text-slate-400 text-[13px] leading-relaxed mb-3">
            Given any copy of the résumé PDF — downloaded from this site, received in an application, or archived by a recruiter —
            you can look up the SHA on the site and follow the chain: source commit → workflow run → portfolio commit (<span className="font-mono text-slate-300 text-[11px]">ci: update resume.pdf [sha: {resumeMeta.shaShort}]</span>) → Vercel deploy.
            Zero ambiguity, full audit trail.
          </p>

          {/* Source → artifact commit chain (shown when both are tracked) */}
          {sourceShaShort && sourceShaShort !== resumeMeta.shaShort && (
            <p className="text-[10px] font-mono text-slate-600 mb-3">
              Source commit{' '}
              <a
                href={`https://github.com/angelorscoelho/resume/commit/${sourceSha}`}
                target="_blank"
                rel="noreferrer"
                className="text-teal-300/70 hover:text-teal-300"
              >
                #{sourceShaShort}
              </a>
              {' '}→ artifact commit{' '}
              <a
                href={resumeMeta.resumeCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="text-teal-300/70 hover:text-teal-300"
              >
                #{resumeMeta.shaShort}
              </a>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <a
              href="https://github.com/angelorscoelho/resume/commits/main"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/60 bg-slate-900/50 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-teal-300 hover:border-teal-400/40 transition-colors"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              Resume commits
              <ExternalLinkIcon className="w-3 h-3 opacity-50" />
            </a>
            <a
              href="https://github.com/angelorscoelho/angelorscoelho.dev/commits/main"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/60 bg-slate-900/50 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-teal-300 hover:border-teal-400/40 transition-colors"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              Portfolio commits
              <ExternalLinkIcon className="w-3 h-3 opacity-50" />
            </a>
            {resumeMeta.shaShort !== '0000000' && (
              <a
                href={resumeMeta.resumeCommitUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-teal-400/30 bg-teal-400/5 px-2.5 py-1 text-[11px] font-medium text-teal-300 hover:border-teal-400/60 transition-colors"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
                Commit #{resumeMeta.shaShort}
                <ExternalLinkIcon className="w-3 h-3 opacity-50" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* ── Footer summary ── */}
    <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500 pt-3 border-t border-slate-700/50">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block"></span>
        Fully automated — push once, deploy everywhere
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>
        Both repos are public &amp; forkable
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>
        CI badges are live from GitHub
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block"></span>
        Every PDF version is SHA-traceable
      </span>
    </div>
  </div>
);
