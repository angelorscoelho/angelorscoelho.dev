import React, { useMemo } from 'react';

// Configuration
const VERTICAL_LINES = 20;
const HORIZONTAL_LINES = 12;
const TRACE_COLOR_DIM = "#1e293b"; // Slate-800
const TRACE_COLOR_LIT = "#2dd4bf"; // Teal-400

export const PCBBackground = () => {
  // Generate static configuration for lines using useMemo
  // This ensures the pattern is consistent across renders
  const { vLines, hLines } = useMemo(() => {
    // Generate Vertical Lines
    const v = Array.from({ length: VERTICAL_LINES }).map((_, i) => ({
      // Position as percentage (evenly spaced)
      pos: (i + 1) * (100 / (VERTICAL_LINES + 1)),
      // Animation props
      duration: 3 + Math.random() * 7, // Random duration between 3-10s
      delay: Math.random() * 5,
      direction: Math.random() > 0.5 ? 1 : -1
    }));

    // Generate Horizontal Lines
    const h = Array.from({ length: HORIZONTAL_LINES }).map((_, i) => ({
      pos: (i + 1) * (100 / (HORIZONTAL_LINES + 1)),
      duration: 5 + Math.random() * 8, // Generally slower horizontally
      delay: Math.random() * 5,
      direction: Math.random() > 0.5 ? 1 : -1
    }));
    
    return { vLines: v, hLines: h };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-slate-900 pointer-events-none overflow-hidden">
      <svg 
        className="absolute inset-0 w-full h-full" 
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* 1. Base Static Grid (Dim Wires) */}
        {vLines.map((line, i) => (
            <line 
                key={`v-static-${i}`} 
                x1={line.pos} y1="0" x2={line.pos} y2="100" 
                stroke={TRACE_COLOR_DIM} 
                strokeWidth="1"
                strokeOpacity="0.3"
                vectorEffect="non-scaling-stroke"
            />
        ))}
        {hLines.map((line, i) => (
            <line 
                key={`h-static-${i}`} 
                x1="0" y1={line.pos} x2="100" y2={line.pos} 
                stroke={TRACE_COLOR_DIM} 
                strokeWidth="1"
                strokeOpacity="0.3"
                vectorEffect="non-scaling-stroke"
            />
        ))}

        {/* 2. Active Light Packets (Animated) */}
        {vLines.map((line, i) => (
            <line 
                key={`v-anim-${i}`} 
                x1={line.pos} y1="0" x2={line.pos} y2="100" 
                stroke={TRACE_COLOR_LIT} 
                strokeWidth="2"
                strokeOpacity="0.8"
                strokeDasharray="5 95" 
                pathLength="100"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            >
                <animate 
                    attributeName="stroke-dashoffset"
                    from={line.direction === 1 ? "100" : "-100"}
                    to={line.direction === 1 ? "-100" : "100"}
                    dur={`${line.duration}s`}
                    begin={`${line.delay}s`}
                    repeatCount="indefinite"
                />
            </line>
        ))}

        {hLines.map((line, i) => (
            <line 
                key={`h-anim-${i}`} 
                x1="0" y1={line.pos} x2="100" y2={line.pos} 
                stroke={TRACE_COLOR_LIT} 
                strokeWidth="2"
                strokeOpacity="0.8"
                strokeDasharray="5 95"
                pathLength="100"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            >
                 <animate 
                    attributeName="stroke-dashoffset"
                    from={line.direction === 1 ? "100" : "-100"}
                    to={line.direction === 1 ? "-100" : "100"}
                    dur={`${line.duration}s`}
                    begin={`${line.delay}s`}
                    repeatCount="indefinite"
                />
            </line>
        ))}
      </svg>
    </div>
  );
};