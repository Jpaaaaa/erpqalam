import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IonName = ComponentProps<typeof Ionicons>['name'];

/** Prev/next day controls: swap chevron glyphs in RTL. */
export function dateStepChevron(
  direction: 'prev' | 'next',
  rtl: boolean,
): IonName {
  if (direction === 'prev') {
    return rtl ? 'chevron-forward' : 'chevron-back';
  }
  return rtl ? 'chevron-back' : 'chevron-forward';
}

/** Row disclosure / menu navigation. */
export function rowChevron(rtl: boolean): IonName {
  return rtl ? 'chevron-back' : 'chevron-forward';
}
