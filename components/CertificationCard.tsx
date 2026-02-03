import React, { useRef } from 'react';
import { Certification } from '../types';
import { ExternalLinkIcon } from './Icon';
import { useSpotlight } from '../utils/useSpotlight';

interface CertificationCardProps {
  cert: Certification;
}

export const CertificationCard: React.FC<CertificationCardProps> = ({ cert }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  useSpotlight(cardRef);

  return (
    <a 
      ref={cardRef}
      href={cert.url} 
      target="_blank" 
      rel="noreferrer"
      className="group relative grid grid-cols-8 gap-4 transition-all p-3 rounded-lg -mx-3 border border-slate-800/50 bg-slate-900/90 hover:bg-slate-900 shadow-sm"
    >
      {/* Spotlight Background Layer */}
      <div 
        className="absolute -inset-px z-0 rounded-lg transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(94, 234, 212, 0.1), transparent 40%)`
        }}
      ></div>

       {/* Border Highlight Layer */}
       <div 
        className="absolute -inset-px z-0 rounded-lg border border-teal-300/30 transition-all duration-300 pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
           maskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
           WebkitMaskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
        }}
      ></div>

      <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-500 mt-1 z-10">{cert.year}</div>
      <div className="col-span-6 flex justify-between items-start z-10">
          <div>
            <h4 className="font-medium text-slate-200 group-hover:text-teal-300 transition-colors flex items-center">
              {cert.name}
              <ExternalLinkIcon className="ml-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>
            <p className="text-sm text-slate-500">{cert.issuer}</p>
          </div>
      </div>
    </a>
  );
};