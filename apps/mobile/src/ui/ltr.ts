import { type TextStyle } from 'react-native';

/** Latin/numeric islands that must not inherit the UI writing direction. */
export const ltrText: TextStyle = {
  writingDirection: 'ltr',
  textAlign: 'left',
};
