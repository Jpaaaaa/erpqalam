import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { MoreStackParamList } from '../navigation/types';
import { useAuth } from '../auth/context';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HomeGlassCard } from '../components/home/HomeGlassCard';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import { MoreLanguageSheet } from '../components/more/MoreLanguageSheet';
import {
  MoreMenuGroupedCard,
  type MoreMenuRowConfig,
} from '../components/more/MoreMenuRows';
import { MoreProfileCard } from '../components/more/MoreProfileCard';
import { MoreSettingsCard } from '../components/more/MoreSettingsCard';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { mirroredRow } from '../ui/rtlLayout';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreMenu'>;

type MoreMenuRoute = Exclude<
  keyof MoreStackParamList,
  'MoreMenu' | 'EmployeeDetail' | 'EmployeesList'
>;

type MenuItem = {
  key: MoreMenuRoute;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  manageOnly?: boolean;
};

const ITEMS: MenuItem[] = [
  { key: 'Daily', labelKey: 'more.daily', icon: 'calendar' },
  { key: 'EmployeeReport', labelKey: 'more.report', icon: 'stats-chart' },
  { key: 'Holidays', labelKey: 'more.holidays', icon: 'sunny' },
  {
    key: 'ManualPunch',
    labelKey: 'more.manual',
    icon: 'create',
    manageOnly: true,
  },
];

const APP_VERSION = Constants.expoConfig?.version ?? '0.1.0';

export function MoreMenuScreen({ navigation }: Props) {
  const { t } = useTranslation('attendance');
  const canManage = useCanManageAttendance();
  const { user, refreshUser, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom);
  const [refreshing, setRefreshing] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      setStatusBarStyle(isDark ? 'light' : 'dark');
    }, [isDark]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  const attendanceRows = useMemo((): MoreMenuRowConfig[] => {
    const employeesRow: MoreMenuRowConfig = {
      key: 'EmployeesList',
      label: t('more.employees'),
      icon: 'people',
      iconColor: palette.blue,
      tileBg: isDark
        ? 'rgba(37, 99, 235, 0.22)'
        : 'rgba(37, 99, 235, 0.12)',
      onPress: () => navigation.navigate('EmployeesList'),
    };

    const rest = ITEMS.filter((item) => !item.manageOnly || canManage).map(
      (item) => {
        const isManual = item.key === 'ManualPunch';
        const isReport = item.key === 'EmployeeReport';
        const isHolidays = item.key === 'Holidays';
        const iconColor = isManual
          ? palette.teal
          : isReport
            ? palette.blue
            : isHolidays
              ? '#D97706'
              : palette.teal;
        const tileBg = isManual
          ? palette.teal
          : isReport
            ? isDark
              ? 'rgba(37, 99, 235, 0.22)'
              : 'rgba(37, 99, 235, 0.12)'
            : isHolidays
              ? isDark
                ? 'rgba(217, 119, 6, 0.22)'
                : 'rgba(245, 158, 11, 0.18)'
              : isDark
                ? 'rgba(20, 184, 166, 0.22)'
                : 'rgba(20, 184, 166, 0.12)';

        return {
          key: item.key,
          label: t(item.labelKey),
          icon: item.icon,
          iconColor,
          tileBg,
          filled: isManual,
          onPress: () => navigation.navigate(item.key),
        };
      },
    );

    return [employeesRow, ...rest];
  }, [canManage, isDark, navigation, palette, t]);

  function openMoreDaily() {
    navigation.navigate('Daily', { attentionOnly: true });
  }

  function confirmSignOut() {
    Alert.alert(t('more.signOutConfirmTitle'), t('more.signOutConfirmMessage'), [
      { text: t('records.cancel'), style: 'cancel' },
      {
        text: t('more.signOut'),
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <HomeGlassBackground isDark={isDark} />
      <SafeAreaView style={styles.safe} edges={[]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: scrollBottomPad },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={palette.teal}
            />
          }
        >
          <View style={[styles.headerBlock, { paddingTop: insets.top }]}>
            <HomeHeader
              user={user}
              alertCount={0}
              onBellPress={openMoreDaily}
            />
            <Text style={styles.screenTitle}>{t('tabs.more')}</Text>
          </View>

          {user ? <MoreProfileCard user={user} /> : null}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('more.sectionAttendance')}</Text>
            <MoreMenuGroupedCard rows={attendanceRows} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('more.sectionSettings')}</Text>
            <MoreSettingsCard onOpenLanguage={() => setLanguageOpen(true)} />
          </View>

          <HomeGlassCard padding={0}>
            <Pressable
              onPress={confirmSignOut}
              style={({ pressed }) => [
                styles.signOutRow,
                mirroredRow(mirrorLayout),
                pressed && styles.signOutPressed,
              ]}
            >
              <Text style={styles.signOutText}>{t('more.signOut')}</Text>
            </Pressable>
          </HomeGlassCard>

          <Text style={styles.version}>v{APP_VERSION}</Text>
        </ScrollView>
      </SafeAreaView>

      <MoreLanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? HOME_BG_DARK : HOME_BG_LIGHT,
    },
    safe: { flex: 1, backgroundColor: 'transparent' },
    scroll: { paddingHorizontal: 16, gap: 16 },
    headerBlock: { gap: 8, marginBottom: 4 },
    screenTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 28,
      lineHeight: 36,
      color: text,
    },
    section: { gap: 10 },
    sectionLabel: {
      fontFamily: typography.noto.bold,
      fontSize: 13,
      color: muted,
      paddingHorizontal: 4,
    },
    signOutRow: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    signOutPressed: { opacity: 0.85 },
    signOutText: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: '#EF4444',
    },
    version: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: muted,
      textAlign: 'center',
      marginTop: 8,
    },
  });
}
