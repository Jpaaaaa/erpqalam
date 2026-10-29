import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AuthUser } from '../../types/auth';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import { HomeGlassCard } from '../home/HomeGlassCard';

function profileName(user: AuthUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email;
}

function profileInitial(user: AuthUser): string {
  const name = profileName(user);
  const ch = name.charAt(0) || user.email.charAt(0) || '?';
  return ch.toUpperCase();
}

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

export function MoreProfileCard({ user }: { user: AuthUser }) {
  const { t } = useTranslation('attendance');
  const { isDark, palette } = useHomeTheme();
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );

  const initial = profileInitial(user);
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;
  const roleKey = user.role === 'MANAGER' ? 'more.roleManager' : 'more.roleEmployee';

  return (
    <HomeGlassCard padding={16}>
      <View style={[styles.row, mirroredRow(mirrorLayout)]}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarLetter, { fontFamily: initialFont }]}>
            {initial}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {profileName(user)}
          </Text>
          <Text
            style={[styles.email, ltrText]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {user.email}
          </Text>
          <View style={styles.pillWrap}>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{t(roleKey)}</Text>
            </View>
          </View>
        </View>
      </View>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const pillBg = isDark ? 'rgba(20, 184, 166, 0.18)' : 'rgba(20, 184, 166, 0.12)';
  const avatarBg = isDark ? 'rgba(20, 184, 166, 0.28)' : 'rgba(20, 184, 166, 0.16)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: avatarBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 22,
      color: teal,
    },
    meta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 17,
      lineHeight: 24,
      color: text,
    },
    email: {
      fontFamily: typography.inter.semibold,
      fontSize: 13,
      lineHeight: 18,
      color: muted,
    },
    pillWrap: {
      marginTop: 6,
      alignSelf: 'flex-start',
    },
    rolePill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: pillBg,
    },
    rolePillText: {
      fontFamily: typography.noto.medium,
      fontSize: 11,
      color: isDark ? '#5EEAD4' : '#0F766E',
    },
  });
}
