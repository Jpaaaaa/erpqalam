import type { ReactNode } from 'react';

interface PageCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-5 sm:p-8',
};

export function PageCard({
  children,
  className = '',
  padding = 'md',
}: PageCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-card sm:rounded-3xl ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
