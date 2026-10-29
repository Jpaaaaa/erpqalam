import { useMemo } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import type { AuthUser } from '../../types/auth';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_MUTED_DARK,
  GLASS_MUTED_LIGHT,
} from './homeGlass';

const BAR_HEIGHT = 56;
const LOGO = 32;
const BELL = 40;
const AVATAR = 36;
const GAP = 12;

function displayName(user: AuthUser | null): string {
  if (!user) return '';
  const first = user.firstName?.trim();
  if (first) return first;
  const username = user.username?.trim();
  if (username) return username;
  return user.email.split('@')[0] ?? '';
}

function initials(user: AuthUser | null): string {
  const name = displayName(user);
  const ch = name.charAt(0) || user?.email?.charAt(0) || '?';
  return ch.toUpperCase();
}

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

function schoolTitle(user: AuthUser | null, fallback: string): string {
  const name = user?.schoolName?.trim();
  return name || fallback;
}

export function HomeHeader({
  user,
  alertCount,
  schoolLogoSource,
  onAvatarPress,
  onBellPress,
}: {
  user: AuthUser | null;
  alertCount: number;
  /** When the API exposes a school logo URL, pass `{ uri }` here. */
  schoolLogoSource?: ImageSourcePropType | null;
  onAvatarPress?: () => void;
  onBellPress?: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const initial = initials(user);
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;
  const title = schoolTitle(user, t('common:appName'));

  return (
    <View style={[styles.bar, mirroredRow(mirrorLayout)]}>
      <View style={[styles.brand, mirroredRow(mirrorLayout)]}>
        <View style={styles.logoBox}>
          {schoolLogoSource ? (
            <Image
              source={schoolLogoSource}
              style={styles.logoImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Text style={[styles.logoLetter, { fontFamily: typography.inter.bold }]}>
              Q
            </Text>
          )}
        </View>
        <Text style={styles.schoolName} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>

      <View style={[styles.actions, mirroredRow(mirrorLayout)]}>
        <Pressable
          style={({ pressed }) => [styles.bellBtn, pressed && styles.pressed]}
          onPress={onBellPress}
          accessibilityRole="button"
          accessibilityLabel={t('home.needsAttention')}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT}
          />
          {alertCount > 0 ? <View style={styles.bellDot} /> : null}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel={displayName(user) || t('more.profile')}
        >
          <Text style={[styles.avatarText, { fontFamily: initialFont }]}>{initial}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const border = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const bellFill = isDark ? 'rgba(31, 38, 48, 0.55)' : 'rgba(255, 255, 255, 0.55)';

  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: BAR_HEIGHT,
      gap: GAP,
      marginBottom: 16,
      backgroundColor: 'transparent',
    },
    brand: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: GAP,
      minWidth: 0,
      backgroundColor: 'transparent',
    },
    logoBox: {
      width: LOGO,
      height: LOGO,
      borderRadius: 10,
      backgroundColor: '#14B8A6',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoImage: {
      width: LOGO,
      height: LOGO,
    },
    logoLetter: {
      fontSize: 17,
      lineHeight: 20,
      fontWeight: 'normal',
      color: '#FFFFFF',
    },
    schoolName: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 'normal',
      color: text,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: GAP,
      backgroundColor: 'transparent',
    },
    bellBtn: {
      width: BELL,
      height: BELL,
      borderRadius: BELL / 2,
      backgroundColor: bellFill,
      borderWidth: 1,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    avatar: {
      width: AVATAR,
      height: AVATAR,
      borderRadius: AVATAR / 2,
      backgroundColor: isDark ? '#17332F' : '#E6F7F5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: 'normal',
      color: '#14B8A6',
    },
    pressed: { opacity: 0.88 },
    bellDot: {
      position: 'absolute',
      top: 9,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#EF4444',
      borderWidth: 1.5,
      borderColor: bellFill,
    },
  });
}
