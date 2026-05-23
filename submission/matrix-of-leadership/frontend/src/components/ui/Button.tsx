import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--accent-copper)] text-[#1C1B1A] hover:bg-[#E58842] active:scale-[0.98] focus-visible:ring-[var(--accent-copper)] shadow-[0_2px_4px_rgba(217,119,54,0.2)] hover:shadow-[0_4px_8px_rgba(217,119,54,0.3)]",
    secondary: "bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--accent-light)] hover:bg-[var(--bg-card)] active:scale-[0.98] focus-visible:ring-[var(--accent-light)]",
    danger: "bg-[var(--risk-red)] text-white hover:bg-[#F26455] active:scale-[0.98] focus-visible:ring-[var(--risk-red)]",
    ghost: "text-[var(--accent-light)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] active:scale-[0.98] focus-visible:ring-[var(--accent-light)]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-sm rounded-sm",
    lg: "px-6 py-3 text-base rounded-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

