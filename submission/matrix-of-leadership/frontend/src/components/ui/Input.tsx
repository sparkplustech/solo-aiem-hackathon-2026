import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--accent-light)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-main)]
            px-4 py-2.5 rounded-sm transition-all duration-300 ease-out
            focus:outline-none focus:border-[var(--accent-copper)] focus:ring-1 focus:ring-[var(--accent-copper)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--risk-red)] focus:border-[var(--risk-red)] focus:ring-[var(--risk-red)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-[var(--risk-red)] mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

