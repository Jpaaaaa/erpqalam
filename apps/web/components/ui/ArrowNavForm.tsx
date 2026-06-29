'use client';

import { FormHTMLAttributes, useRef } from 'react';
import { useFormArrowNavigation } from '@/lib/hooks/useFormArrowNavigation';

interface ArrowNavFormProps extends FormHTMLAttributes<HTMLFormElement> {
  arrowNav?: boolean;
}

export function ArrowNavForm({
  arrowNav = true,
  children,
  ...props
}: ArrowNavFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  useFormArrowNavigation(formRef, arrowNav);

  return (
    <form ref={formRef} {...props}>
      {children}
    </form>
  );
}
