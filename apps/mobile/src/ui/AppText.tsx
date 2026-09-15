import { StyleSheet, Text, type TextProps } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';

function isBoldWeight(weight: string | number | undefined): boolean {
  if (weight === undefined) return false;
  if (weight === 'bold' || weight === 'semibold') return true;
  const n = typeof weight === 'string' ? parseInt(weight, 10) : weight;
  return typeof n === 'number' && !Number.isNaN(n) && n >= 600;
}

export function AppText({ style, ...rest }: TextProps) {
  const { fontFamily, fontFamilyBold } = useI18n();
  const flat = StyleSheet.flatten(style);
  const bold = isBoldWeight(flat?.fontWeight);
  const family = bold ? fontFamilyBold ?? fontFamily : fontFamily;
  return (
    <Text
      {...rest}
      style={[
        family ? { fontFamily: family } : null,
        style,
        family && bold ? { fontWeight: 'normal' } : null,
      ]}
    />
  );
}
