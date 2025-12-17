import React, { useRef } from 'react';
import { Job } from '../types';
import { useSpotlight } from '../utils/useSpotlight';

interface ExperienceCardProps {
  job: Job;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ job }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useSpotlight(cardRef);

  return (
    <div 
      ref={cardRef}
      className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 rounded-md"
    >
      {/* 
         Background Layer: 
         - Default: Transparent
         - Hover: High opacity dark slate (slate-900 at 95% opacity) to block the PCB background for readability.
      */}
      <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition-all motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-900/95 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>

      {/* Spotlight Layer */}
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
      
      <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2 group-hover:text-slate-300 transition-colors" aria-label={job.period}>
        {job.period}
      </header>
      
      <div className="z-10 sm:col-span-6">
        <h3 className="font-medium leading-snug text-slate-200">
          <div>
            <span className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 text-base">
              <span>{job.role} · <span className="inline-block">{job.company}</span></span>
            </span>
          </div>
          <div className="text-slate-500 text-sm font-normal mt-1 group-hover:text-slate-400 transition-colors">{job.location}</div>
        </h3>
        
        <p className="mt-2 text-sm leading-normal text-slate-400 group-hover:text-slate-300 transition-colors">
          {job.description}
        </p>

        <ul className="mt-2 text-sm leading-normal list-disc list-outside ml-4 marker:text-teal-300 text-slate-400 group-hover:text-slate-300 transition-colors">
           {job.achievements.slice(0, 3).map((ach, i) => (
               <li key={i} className="mb-1">{ach}</li>
           ))}
        </ul>
        
        <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
          {job.skills.map((skill, index) => (
            <li key={index} className="mr-1.5 mt-2">
              <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 border border-transparent group-hover:border-teal-300/20 transition-colors">
                {skill}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};