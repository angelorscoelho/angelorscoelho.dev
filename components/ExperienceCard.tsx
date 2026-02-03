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
      className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 rounded-lg border border-slate-800/50 p-6 bg-slate-900/90 hover:bg-slate-900/100 shadow-sm"
    >
      <div 
        className="absolute -inset-px z-0 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(94, 234, 212, 0.1), transparent 40%)`
        }}
      ></div>

      <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2 group-hover:text-slate-300 transition-colors">
        {job.period}
      </header>
      
      <div className="z-10 sm:col-span-6">
        <h3 className="font-medium leading-snug text-slate-200">
          <div>
            <span className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 text-lg">
              <span>{job.role} · <span className="inline-block">{job.company}</span></span>
            </span>
          </div>
          <div className="text-slate-500 text-sm font-normal mt-1 group-hover:text-slate-400 transition-colors">{job.location}</div>
        </h3>
        
        <p className="mt-2 text-sm leading-normal text-slate-400 group-hover:text-slate-300 transition-colors">
          {job.description}
        </p>

        <ul className="mt-3 text-sm leading-normal list-disc list-outside ml-4 marker:text-teal-300 text-slate-400 group-hover:text-slate-300 transition-colors space-y-1">
           {job.achievements.map((ach, i) => (
               <li key={i}>{ach}</li>
           ))}
        </ul>
        
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
          {job.skills.map((skill, index) => (
            <li key={index}>
              <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 border border-teal-300/10 group-hover:border-teal-300/30 transition-colors">
                {skill}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};