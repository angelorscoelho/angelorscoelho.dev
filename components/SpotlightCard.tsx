import React, { useRef } from 'react';
import { useSpotlight } from '../utils/useSpotlight';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useSpotlight(cardRef);

  return (
    <div 
      ref={cardRef}
      className={`group relative rounded-lg border border-slate-800/50 bg-slate-900/90 p-6 shadow-xl ${className}`}
    >
      {/* Hover Spotlight Background */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(94, 234, 212, 0.1), transparent 40%)`
        }}
      />
      
      {/* Border Highlight */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-lg border border-teal-300/30 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
           maskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
           WebkitMaskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
        }}
      />

      <div className="relative">
        {children}
      </div>
    </div>
  );
};