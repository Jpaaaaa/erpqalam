import { ButtonHTMLAttributes } from 'react';

type IconButtonVariant = 'secondary' | 'ghost' | 'primary' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: IconButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
}

const variants: Record<IconButtonVariant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-soft hover:opacity-95 focus-visible:ring-teal-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger:
    'border border-red-100 bg-white text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-400',
};

export function IconButton({
  label,
  variant = 'secondary',
  isLoading = false,
  loadingLabel = '...',
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      title={isLoading ? loadingLabel : label}
      aria-label={label}
      aria-busy={isLoading}
      disabled={disabled || isLoading}
      className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
