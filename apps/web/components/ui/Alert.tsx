interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export function Alert({ variant = 'info', children }: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}>
      {children}
    </div>
  );
}
