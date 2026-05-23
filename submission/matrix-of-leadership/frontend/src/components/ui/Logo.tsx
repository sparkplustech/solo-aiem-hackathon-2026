import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "w-8 h-8", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`text-ui-text ${className}`}
      >
        {/* Outer Square border - stark neo-brutalist box */}
        <rect x="5" y="5" width="90" height="90" stroke="currentColor" strokeWidth="10" />
        
        {/* Inner geometric eye/lens shape */}
        <circle cx="50" cy="50" r="20" fill="currentColor" />
        
        {/* Sharp diagonal intersection line */}
        <line x1="5" y1="95" x2="95" y2="5" stroke="var(--bg-primary)" strokeWidth="8" />
        <line x1="5" y1="95" x2="95" y2="5" stroke="var(--accent-copper)" strokeWidth="4" />
      </svg>
      
      {showText && (
        <span className="font-mono font-bold tracking-[0.2em] text-lg text-ui-text uppercase">
          Drishti
        </span>
      )}
    </div>
  );
}
