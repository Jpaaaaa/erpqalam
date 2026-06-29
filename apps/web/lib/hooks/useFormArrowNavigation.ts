'use client';

import { RefObject, useEffect } from 'react';

const FOCUSABLE =
  'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])';

function getFocusables(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null,
  );
}

function placeCaretAtEnd(el: HTMLInputElement | HTMLTextAreaElement) {
  const len = el.value.length;
  el.setSelectionRange(len, len);
}

export function useFormArrowNavigation(
  formRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const form = formRef.current;
    if (!form) return;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !form!.contains(target)) return;
      if (
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        target.tagName !== 'SELECT'
      ) {
        return;
      }

      const key = event.key;
      if (key !== 'ArrowUp' && key !== 'ArrowDown') return;

      // Keep native line navigation inside multi-line fields.
      if (target.tagName === 'TEXTAREA') return;

      const focusables = getFocusables(form!);
      const index = focusables.indexOf(target);
      if (index === -1) return;

      // Up → next field, down → previous field (tab order).
      const nextIndex = key === 'ArrowUp' ? index + 1 : index - 1;
      if (nextIndex < 0 || nextIndex >= focusables.length) return;

      event.preventDefault();
      const neighbor = focusables[nextIndex];
      neighbor.focus();
      if (neighbor instanceof HTMLInputElement || neighbor instanceof HTMLTextAreaElement) {
        placeCaretAtEnd(neighbor);
      }
    }

    form.addEventListener('keydown', onKeyDown);
    return () => form.removeEventListener('keydown', onKeyDown);
  }, [formRef, enabled]);
}
