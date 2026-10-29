import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AttentionItem } from '../../hooks/useHomeDashboard';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { formatDisplayTime } from '../../attendance/formatters';
import { mirroredRow } from '../../ui/rtlLayout';
import { ltrText } from '../../ui/ltr';
import { HomeGlassCard } from './HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from './homeGlass';

const MAX_ROWS = 3;

const STATUS_STYLE = {
  late: {
    avatarBg: 'rgba(245, 158, 11, 0.22)',
    avatarInk: '#D97706',
    pillBg: 'rgba(245, 158, 11, 0.14)',
    pillInk: '#B45309',
    labelKey: 'home.pillLate',
  },
  absent: {
    avatarBg: 'rgba(239, 68, 68, 0.2)',
    avatarInk: '#DC2626',
    pillBg: 'rgba(239, 68, 68, 0.12)',
    pillInk: '#DC2626',
    labelKey: 'home.pillAbsent',
  },
  early_exit: {
    avatarBg: 'rgba(249, 115, 22, 0.22)',
    avatarInk: '#EA580C',
    pillBg: 'rgba(249, 115, 22, 0.14)',
    pillInk: '#C2410C',
    labelKey: 'daily.status.early_exit',
  },
} as const;

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

export function NeedsAttentionSection({
  items,
  onRowPress,
  onSeeAll,
}: {
  items: AttentionItem[];
  onRowPress: (deviceUserId: string) => void;
  onSeeAll: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  if (items.length === 0) {
    return (
      <Text style={styles.allGood}>{t('home.allGood')}</Text>
    );
  }

  const visible = items.slice(0, MAX_ROWS);
  const total = items.length;

  return (
    <HomeGlassCard padding={20}>
      <View style={[styles.cardInner, GLASS_INNER_CONTENT]}>
      <View style={[styles.header, mirroredRow(mirrorLayout), GLASS_INNER_CONTENT]}>
        <Text style={styles.title}>{t('home.needsAttention')}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{total}</Text>
        </View>
      </View>

      {visible.map((item, index) => (
        <AttentionRow
          key={item.deviceUserId}
          item={item}
          isLast={index === visible.length - 1}
          mirrorLayout={mirrorLayout}
          onPress={() => onRowPress(item.deviceUserId)}
          styles={styles}
          typography={typography}
          t={t}
        />
      ))}

      {total > MAX_ROWS ? (
        <Pressable
          style={({ pressed }) => [styles.footer, pressed && styles.footerPressed]}
          onPress={onSeeAll}
          accessibilityRole="button"
        >
          <Text style={styles.footerText}>
            {t('home.seeAllAttention', { count: total })}
          </Text>
        </Pressable>
      ) : null}
      </View>
    </HomeGlassCard>
  );
}

function AttentionRow({
  item,
  isLast,
  mirrorLayout,
  onPress,
  styles,
  typography,
  t,
}: {
  item: AttentionItem;
  isLast: boolean;
  mirrorLayout: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  typography: AppTypography;
  t: (key: string) => string;
}) {
  const cfg = STATUS_STYLE[item.status as keyof typeof STATUS_STYLE];
  const initial = (item.name.trim().charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;
  const statusText = t(`daily.status.${item.status}`);
  const time =
    item.status === 'late' && item.entryTime
      ? formatDisplayTime(item.entryTime)
      : item.status === 'early_exit' && item.exitTime
        ? formatDisplayTime(item.exitTime)
        : null;
  const pillLabel = t(cfg.labelKey);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.rowInner, mirroredRow(mirrorLayout)]}>
        <View style={[styles.avatar, { backgroundColor: cfg.avatarBg }]}>
          <Text style={[styles.avatarLetter, { fontFamily: initialFont, color: cfg.avatarInk }]}>
            {initial}
          </Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.subline} numberOfLines={1}>
            {statusText}
            {time ? (
              <>
                {' · '}
                <Text style={styles.sublineTime}>{time}</Text>
              </>
            ) : null}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: cfg.pillBg }]}>
          <Text style={[styles.statusPillText, { color: cfg.pillInk }]} numberOfLines={1}>
            {pillLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    cardInner: {
      backgroundColor: 'transparent',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      backgroundColor: 'transparent',
    },
    title: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 'normal',
      color: text,
    },
    badge: {
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.14)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      minWidth: 28,
      alignItems: 'center',
    },
    badgeText: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 'normal',
      color: '#B45309',
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    row: {
      paddingVertical: 12,
      backgroundColor: 'transparent',
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    rowPressed: { opacity: 0.88 },
    rowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: 'transparent',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: 'normal',
    },
    body: {
      flex: 1,
      minWidth: 0,
      backgroundColor: 'transparent',
    },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 'normal',
      color: text,
    },
    subline: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: 'normal',
      color: muted,
      marginTop: 2,
    },
    sublineTime: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      fontWeight: 'normal',
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
      maxWidth: 88,
    },
    statusPillText: {
      fontFamily: typography.noto.medium,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: 'normal',
      textAlign: 'center',
    },
    footer: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: divider,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    footerPressed: { opacity: 0.75 },
    footerText: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: 'normal',
      color: muted,
    },
    allGood: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: 'normal',
      color: '#14B8A6',
      textAlign: 'center',
      marginVertical: 4,
    },
  });
}
