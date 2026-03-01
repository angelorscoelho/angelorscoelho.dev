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
      className="group relative grid transition-all sm:grid-cols-12 sm:gap-8 rounded-lg p-6 bg-slate-900/90 hover:bg-slate-900/100 border border-slate-800/50"
    >
      <div 
        className="absolute -inset-px z-0 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(94, 234, 212, 0.1), transparent 40%)`
        }}
      ></div>

      <div className="z-10 sm:col-span-12">
        <h3 className="font-medium leading-snug text-slate-200">
          <div className="flex items-center gap-2">
             {project.link ? (
                <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 text-lg group/link">
                   {project.title}
                   <ExternalLinkIcon className="ml-1 inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
                </a>
             ) : (
                <span className="text-slate-200 text-lg">{project.title}</span>
             )}
          </div>
        </h3>
        
        <p className="mt-3 text-base leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
          {project.description}
        </p>

        {project.github && (
           <div className="mt-4 relative z-10">
               <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center text-sm text-slate-400 hover:text-teal-300 transition-colors w-fit">
                   <GitHubIcon className="w-5 h-5 mr-2"/> View Source Code
               </a>
           </div>
        )}
        
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies used">
          {project.technologies.map((tech, index) => (
            <li key={index}>
              <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 border border-teal-300/10 group-hover:border-teal-300/30 transition-colors">
                {tech}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};