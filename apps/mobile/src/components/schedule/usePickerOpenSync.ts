import { useEffect, useRef } from 'react';

/** Run `sync` only when the picker transitions from closed → open (not on every `value` tick). */
export function usePickerOpenSync(visible: boolean, sync: () => void): void {
  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      sync();
    }
    wasVisible.current = visible;
  }, [visible, sync]);
}
