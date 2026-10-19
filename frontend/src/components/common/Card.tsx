import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl',
    elevated: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-black/5 dark:shadow-black/40 rounded-xl',
    glass: 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-xl',
  };

  return (
    <div className={`${variants[variant]} ${paddings[padding]} transition-all duration-150 ${className}`} {...props}>
      {children}
    </div>
  );
};
