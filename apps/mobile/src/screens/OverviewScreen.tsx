import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { BlurTargetView } from 'expo-blur';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { HomeHeader } from '../components/home/HomeHeader';
import { RingSummaryCard } from '../components/home/RingSummaryCard';
import { QuickActionsRow } from '../components/home/QuickActionsRow';
import { NeedsAttentionSection } from '../components/home/NeedsAttentionSection';
import { RecentRecordsFeed } from '../components/home/RecentRecordsFeed';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import { useAuth } from '../auth/context';
import {
  navigateToEmployeeDetail,
  navigateToMoreMenu,
  navigateToMoreStackScreen,
} from '../navigation/nestedTabNavigation';
import type { MainTabParamList } from '../navigation/types';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { AppText } from '../ui/AppText';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import { useHomeBlurTarget } from '../components/home/HomeBlurTargetContext';

type HomeNav = BottomTabNavigationProp<MainTabParamList, 'Overview'>;

export function OverviewScreen() {
  const { t } = useTranslation('attendance');
  const navigation = useNavigation<HomeNav>();
  const { user } = useAuth();
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom);
  const blurTarget = useHomeBlurTarget();
  const styles = useMemo(
    () => createStyles(palette, isDark),
    [palette, isDark],
  );
  const {
    loading,
    refreshing,
    setRefreshing,
    error,
    errorIsNetwork,
    load,
    summary,
    attendancePct,
    punctualityPct,
    weeklyAvg,
    attentionItems,
    recentRecords,
    nameLookup,
  } = useHomeDashboard();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      setStatusBarStyle(isDark ? 'light' : 'dark');
      return () => {
        if (Platform.OS === 'android') {
          RNStatusBar.setTranslucent(false);
          RNStatusBar.setBackgroundColor(isDark ? HOME_BG_DARK : HOME_BG_LIGHT);
        }
        setStatusBarStyle('dark');
        blurTarget?.setReady(false);
      };
    }, [isDark, blurTarget]),
  );

  if (loading && !summary) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.teal} />
        <AppText style={styles.muted}>{t('common:loading')}</AppText>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <BlurTargetView
        ref={blurTarget?.ref}
        style={styles.blurTarget}
        collapsable={false}
        onLayout={() => blurTarget?.setReady(true)}
      >
        <HomeGlassBackground isDark={isDark} />
        <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPad }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
              tintColor={palette.teal}
            />
          }
        >
        {!canManage ? (
          <View style={styles.bannerWrap}>
            <ViewOnlyBanner />
          </View>
        ) : null}

        <HomeHeader
          user={user}
          alertCount={attentionItems.length}
          onAvatarPress={() => navigateToMoreMenu(navigation)}
          onBellPress={() =>
            navigateToMoreStackScreen(navigation, 'Daily', {
              attentionOnly: true,
            })
          }
        />

        {errorIsNetwork ? (
          <NetworkErrorPanel message={error} onRetry={() => void load()} />
        ) : error ? (
          <AppText style={styles.error}>{error}</AppText>
        ) : null}

        {summary ? (
          <>
            <RingSummaryCard
              summary={summary}
              attendancePct={attendancePct}
              punctualityPct={punctualityPct}
              weeklyAvgPct={weeklyAvg}
              onOpenDaily={() => navigateToMoreStackScreen(navigation, 'Daily')}
            />

            <QuickActionsRow
              canManage={canManage}
              onManual={() => navigateToMoreStackScreen(navigation, 'ManualPunch')}
              onDaily={() => navigateToMoreStackScreen(navigation, 'Daily')}
              onReport={() =>
                navigateToMoreStackScreen(navigation, 'EmployeeReport')
              }
              onHolidays={() => navigateToMoreStackScreen(navigation, 'Holidays')}
            />

            <NeedsAttentionSection
              items={attentionItems}
              onRowPress={(deviceUserId) =>
                navigateToEmployeeDetail(navigation, {
                  deviceUserId,
                  name: nameLookup.get(deviceUserId) || deviceUserId,
                })
              }
              onSeeAll={() =>
                navigateToMoreStackScreen(navigation, 'Daily', {
                  attentionOnly: true,
                })
              }
            />

            <RecentRecordsFeed
              records={recentRecords}
              nameLookup={nameLookup}
              onSeeAll={() =>
                navigation.navigate('RecordsTab', { screen: 'RecordsList' })
              }
            />
          </>
        ) : null}
        </ScrollView>
        </SafeAreaView>
      </BlurTargetView>
    </View>
  );
}

function createStyles(
  p: ReturnType<typeof useHomeTheme>['palette'],
  isDark: boolean,
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? HOME_BG_DARK : HOME_BG_LIGHT,
    },
    safe: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    blurTarget: { flex: 1 },
    scroll: { flex: 1, backgroundColor: 'transparent' },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: p.bg,
      gap: 8,
    },
    content: {
      padding: 16,
      gap: 20,
      backgroundColor: 'transparent',
    },
    bannerWrap: { marginBottom: -8 },
    muted: { color: p.textMuted },
    error: { color: p.red, marginBottom: 8 },
  });
}
