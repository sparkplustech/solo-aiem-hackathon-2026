import React, { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hoverable = false, ...props }, ref) => {
    const baseStyles = "bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm shadow-[var(--shadow-sm)]";
    const hoverStyles = hoverable ? "transition-all duration-400 ease-out hover:border-[var(--accent-copper)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 cursor-pointer" : "";
    
    return (
      <div ref={ref} className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ children, className = '' }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pb-4 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 mt-auto border-t border-[var(--border-color)] ${className}`}>{children}</div>;
}

