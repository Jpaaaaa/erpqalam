'use client';

import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'a4';
  overlayClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

const sizeClasses = {
  sm: 'w-full max-w-xs shrink-0',
  md: 'w-full max-w-2xl',
  lg: 'w-full max-w-4xl',
  xl: 'w-full max-w-6xl',
  a4: 'h-[92vh] w-[min(420px,90vw)] shrink-0',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  overlayClassName = 'z-50',
  panelClassName = '',
  contentClassName = '',
  footerClassName = '',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={`fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4 ${overlayClassName}`}>
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative flex max-h-[92vh] ${sizeClasses[size]} flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${panelClassName}`}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-slate-900">
            {title}
          </h2>
        </div>
        <div className={`flex-1 overflow-y-auto px-5 py-4 ${contentClassName}`}>
          {children}
        </div>
        {footer && (
          <div
            className={`flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end ${footerClassName}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
