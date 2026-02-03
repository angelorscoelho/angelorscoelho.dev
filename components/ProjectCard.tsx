import React, { useRef } from 'react';
import { Project } from '../types';
import { ExternalLinkIcon, GitHubIcon } from './Icon';
import { useSpotlight } from '../utils/useSpotlight';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useSpotlight(cardRef);

  return (
    <div 
      ref={cardRef}
      className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 rounded-md"
    >
      {/* 
         Background Layer: 
         - Now always visible with high opacity to ensure readability against code background.
      */}
      <div className="absolute -inset-x-4 -inset-y-4 z-0 rounded-md transition-all motion-reduce:transition-none lg:-inset-x-6 bg-slate-900/90 border border-slate-800/50 shadow-sm group-hover:bg-slate-900 group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] group-hover:drop-shadow-lg"></div>

      {/* Spotlight Background Layer */}
      <div 
        className="absolute -inset-x-4 -inset-y-4 z-0 rounded-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 lg:-inset-x-6 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(94, 234, 212, 0.1), transparent 40%)`
        }}
      ></div>

       {/* Border Highlight Layer */}
       <div 
        className="absolute -inset-x-4 -inset-y-4 z-0 rounded-md border border-slate-800/0 transition-all duration-300 lg:-inset-x-6 pointer-events-none group-hover:border-teal-300/30"
        style={{
           maskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
           WebkitMaskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
        }}
      ></div>

      <div className="z-10 sm:col-span-8">
        <h3 className="font-medium leading-snug text-slate-200">
          <div className="flex items-center gap-2">
             {project.link ? (
                <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 text-base group/link">
                   <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                   {project.title}
                   <ExternalLinkIcon className="ml-1 inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                </a>
             ) : (
                <span className="text-slate-200 text-base">{project.title}</span>
             )}
          </div>
        </h3>
        
        <p className="mt-2 text-sm leading-normal text-slate-400 group-hover:text-slate-300 transition-colors">
          {project.description}
        </p>

        {project.github && (
           <div className="mt-2 relative z-10">
               <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center text-xs text-slate-400 hover:text-teal-300 transition-colors w-fit">
                   <GitHubIcon className="w-4 h-4 mr-1"/> View Code
               </a>
           </div>
        )}
        
        <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
          {project.technologies.map((tech, index) => (
            <li key={index} className="mr-1.5 mt-2">
              <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 border border-transparent group-hover:border-teal-300/20 transition-colors">
                {tech}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};