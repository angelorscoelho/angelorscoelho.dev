import React from 'react';
import { GitHubIcon, ExternalLinkIcon, VercelIcon } from './Icon';
import resumeMeta from '../assets/resume-meta.json';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NodeData {
  icon: React.ReactNode;
  owner: string;
  repo: string;
  description: string;
  badges: string[];
  link: string;
  linkAriaLabel: string;
  statusBadgeUrl?: string;
  trigger: string;
}

interface ConnectorData {
  label: string;
  sublabel: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const NodeCard: React.FC<{ node: NodeData }> = ({ node }) => (
  <div className="group flex-1 min-w-0 rounded-xl border border-slate-700 bg-slate-800/50 p-5 hover:border-teal-400/50 transition-all duration-300 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-teal-900/20">
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-teal-400 shrink-0">{node.icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500 font-mono truncate">{node.owner}/</p>
          <h3 className="text-slate-200 font-semibold text-sm truncate">{node.repo}</h3>
        </div>
      </div>
      <a
        href={node.link}
        target="_blank"
        rel="noreferrer"
        aria-label={node.linkAriaLabel}
        className="ml-2 shrink-0 text-slate-500 hover:text-teal-300 transition-colors"
      >
        <ExternalLinkIcon className="w-3.5 h-3.5" />
      </a>
    </div>

    {/* Description */}
    <p className="text-slate-400 text-xs leading-relaxed mb-3">{node.description}</p>

    {/* Trigger pill */}
    <div className="mb-3">
      <span className="inline-flex items-center gap-1 rounded-md border border-slate-600/60 bg-slate-900/60 px-2 py-0.5 text-[10px] font-mono text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0"></span>
        {node.trigger}
      </span>
    </div>

    {/* Tech badges */}
    <div className="flex flex-wrap gap-1.5 mb-3">
      {node.badges.map((b) => (
        <span
          key={b}
          className="rounded-full bg-teal-400/10 px-2 py-0.5 text-[10px] font-medium leading-4 text-teal-300"
        >
          {b}
        </span>
      ))}
    </div>

    {/* CI status badge */}
    {node.statusBadgeUrl && (
      <div className="mt-auto pt-1">
        <img
          src={node.statusBadgeUrl}
          alt="GitHub Actions status"
          className="h-5 rounded"
        />
      </div>
    )}
  </div>
);

const ArrowConnector: React.FC<ConnectorData> = ({ label, sublabel }) => (
  <>
    {/* Mobile: vertical ↓ */}
    <div className="flex lg:hidden flex-col items-center shrink-0 py-1">
      <div className="w-px h-5 bg-teal-500/40"></div>
      <div className="text-center px-3 py-1">
        <span className="block text-[10px] font-mono text-teal-400 leading-tight whitespace-nowrap">{label}</span>
        <span className="block text-[10px] font-mono text-slate-500 leading-tight whitespace-nowrap">{sublabel}</span>
      </div>
      <div className="w-px h-5 bg-teal-500/40"></div>
      {/* Down arrowhead */}
      <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
        <path d="M1 1L6 6L11 1" stroke="rgb(20 184 166 / 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    {/* Desktop: horizontal → */}
    <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-28 px-1">
      <span className="block text-[10px] font-mono text-teal-400 mb-1 text-center leading-tight whitespace-nowrap">{label}</span>
      <span className="block text-[10px] font-mono text-slate-500 mb-1.5 text-center leading-tight whitespace-nowrap">{sublabel}</span>
      <div className="flex items-center w-full">
        <div className="flex-1 h-px bg-teal-500/40"></div>
        {/* Right arrowhead */}
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
          <path d="M1 1L6 6L1 11" stroke="rgb(20 184 166 / 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  </>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const nodes: NodeData[] = [
  {
    icon: <GitHubIcon className="w-5 h-5" />,
    owner: 'angelorscoelho',
    repo: 'resume',
    description:
      'LaTeX source compiled with XeLaTeX and compressed by Ghostscript. Every push to main builds a fresh resume.pdf, commits it back to the repo, and dispatches a workflow in the portfolio.',
    badges: ['LaTeX', 'XeLaTeX', 'Ghostscript', 'GitHub Actions'],
    link: 'https://github.com/angelorscoelho/resume',
    linkAriaLabel: 'View resume repository on GitHub',
    statusBadgeUrl:
      'https://github.com/angelorscoelho/resume/actions/workflows/build-and-publish-resume.yml/badge.svg',
    trigger: 'on: push → main',
  },
  {
    icon: <GitHubIcon className="w-5 h-5" />,
    owner: 'angelorscoelho',
    repo: 'angelorscoelho.dev',
    description:
      'React + Vite portfolio. Receives the workflow_dispatch call from the resume repo, copies the newly built resume.pdf into site assets, commits, and pushes — which in turn cues Vercel.',
    badges: ['React', 'TypeScript', 'Vite', 'GitHub Actions'],
    link: 'https://github.com/angelorscoelho/angelorscoelho.dev',
    linkAriaLabel: 'View portfolio repository on GitHub',
    statusBadgeUrl:
      'https://github.com/angelorscoelho/angelorscoelho.dev/actions/workflows/build_resume.yml/badge.svg',
    trigger: 'on: workflow_dispatch',
  },
  {
    icon: <VercelIcon className="w-5 h-5" />,
    owner: 'vercel',
    repo: 'angelorscoelho.dev',
    description:
      'Zero-config Vite deployment. GitHub integration auto-detects every push to portfolio main and triggers a production build with global CDN distribution — no vercel.json required.',
    badges: ['Vite', 'Serverless', 'CDN', 'Auto-deploy'],
    link: 'https://angelorscoelho.dev',
    linkAriaLabel: 'Open live site on Vercel',
    trigger: 'on: push → main',
  },
];

const connectors: ConnectorData[] = [
  { label: 'workflow_dispatch', sublabel: 'via GitHub REST API' },
  { label: 'git push → main', sublabel: 'GitHub integration' },
];

// ─── Main component ──────────────────────────────────────────────────────────

export const AutomationDiagram: React.FC = () => (
  <div className="space-y-8">
    {/* Intro card */}
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-5 py-4">
      <p className="text-slate-400 text-sm leading-relaxed">
        A fully automated, end-to-end pipeline built across three public repositories — no manual steps required.
        Updating a single line of LaTeX in the resume repo cascades through{' '}
        <span className="text-teal-300 font-medium">GitHub Actions</span> into a live production deployment on{' '}
        <span className="text-teal-300 font-medium">Vercel</span>, all within minutes.
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          Both repos are fully public &amp; forkable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          Zero manual intervention
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          Serverless production delivery
        </span>
      </div>
    </div>

    {/* Diagram */}
    <div className="flex flex-col lg:flex-row items-stretch">
      {nodes.map((node, i) => (
        <React.Fragment key={node.repo}>
          <NodeCard node={node} />
          {i < connectors.length && <ArrowConnector {...connectors[i]} />}
        </React.Fragment>
      ))}
    </div>

    {/* Legend */}
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-500 pt-1 border-t border-slate-700/60">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
        Trigger event
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block w-6 h-px bg-teal-500/40"></span>
        <svg width="7" height="10" viewBox="0 0 7 10" fill="none" className="inline-block">
          <path d="M1 1L6 5L1 9" stroke="rgb(20 184 166 / 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Automated handoff
      </span>
      <span>Badges reflect live CI status from GitHub</span>
    </div>

    {/* Version traceability card */}
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-5 py-4">
      <h3 className="text-slate-200 font-semibold text-sm mb-2">Version Traceability</h3>
      <p className="text-slate-400 text-xs leading-relaxed mb-3">
        Every résumé PDF is built from a specific commit in the{' '}
        <a href="https://github.com/angelorscoelho/resume" target="_blank" rel="noreferrer" className="text-teal-300 hover:underline">resume repo</a>.
        The SHA is captured by the GitHub Actions workflow and written to a metadata file committed alongside the PDF
        — so every deployed version is fully traceable end to end.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Resume repo commit (HEAD when the PDF was pulled) */}
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Resume repo commit</span>
          <a
            href={resumeMeta.resumeCommitUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-teal-300 hover:underline"
          >
            #{resumeMeta.shaShort}
          </a>
        </div>

        {/* Source commit (the human commit that triggered the build) */}
        {resumeMeta.sourceSha && resumeMeta.sourceSha !== resumeMeta.sha && (
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Source commit</span>
            <a
              href={`https://github.com/angelorscoelho/resume/commit/${resumeMeta.sourceSha}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-teal-300 hover:underline"
            >
              #{resumeMeta.sourceShaShort}
            </a>
          </div>
        )}

        {/* Built at */}
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Built at</span>
          <span className="font-mono text-slate-300">{resumeMeta.builtAt}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <a
          href="https://github.com/angelorscoelho/resume/commits/main"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-teal-300 transition-colors"
        >
          <GitHubIcon className="w-3 h-3" />
          Resume commits
        </a>
        <a
          href="https://github.com/angelorscoelho/angelorscoelho.dev/commits/main"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-teal-300 transition-colors"
        >
          <GitHubIcon className="w-3 h-3" />
          Portfolio commits
        </a>
        <a
          href={resumeMeta.resumeWorkflowUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-teal-300 transition-colors"
        >
          <ExternalLinkIcon className="w-3 h-3" />
          CI workflow
        </a>
      </div>
    </div>
  </div>
);
