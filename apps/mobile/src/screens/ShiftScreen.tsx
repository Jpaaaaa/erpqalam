import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import {
  getAttendanceSettings,
  listAttendanceUsers,
  updateAttendanceSettings,
} from '../api/attendance';
import {
  applyShiftScheduleUpdate,
  globalSchedulePayload,
  scheduleFromSettings,
  type ShiftScheduleForm,
} from '../attendance/scheduleModel';
import {
  validateShiftSchedule,
  type ScheduleValidationErrors,
} from '../attendance/scheduleValidation';
import { CustomScheduleListCard } from '../components/shift/CustomScheduleListCard';
import { ShiftHeroCard } from '../components/shift/ShiftHeroCard';
import { ShiftZonesCard } from '../components/shift/ShiftZonesCard';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HomeGlassCard } from '../components/home/HomeGlassCard';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import { WorkingDayPills } from '../components/schedule/WorkingDayPills';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import { useAuth } from '../auth/context';
import { navigateToEmployeeDetail } from '../navigation/nestedTabNavigation';
import type { AttendanceSettings, AttendanceUser } from '../types/attendance';
import type { MainTabParamList } from '../navigation/types';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';

export function ShiftScreen() {
  const { t } = useTranslation('attendance');
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuth();
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const { typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom);

  const [form, setForm] = useState<ShiftScheduleForm | null>(null);
  const [globalSettings, setGlobalSettings] = useState<AttendanceSettings | null>(
    null,
  );
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ScheduleValidationErrors>({});

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      setStatusBarStyle(isDark ? 'light' : 'dark');
    }, [isDark]),
  );

  const load = useCallback(async () => {
    setError('');
    setErrorIsNetwork(false);
    try {
      const [settings, userRows] = await Promise.all([
        getAttendanceSettings(),
        listAttendanceUsers(),
      ]);
      setGlobalSettings(settings);
      setForm(scheduleFromSettings(settings));
      setUsers(userRows);
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'settings.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function persist(next: ShiftScheduleForm) {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateAttendanceSettings(globalSchedulePayload(next));
      setGlobalSettings(updated);
      setForm(scheduleFromSettings(updated));
      setSuccess(t('settings.saved'));
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'settings.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setSaving(false);
    }
  }

  function onSavePress() {
    if (!form || !canManage) return;
    const validation = validateShiftSchedule(form);
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) return;

    Alert.alert(
      t('settings.saveConfirmTitle'),
      t('settings.saveConfirmMessage'),
      [
        { text: t('records.cancel'), style: 'cancel' },
        { text: t('settings.save'), onPress: () => void persist(form) },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <HomeGlassBackground isDark={isDark} />
      <SafeAreaView style={styles.safe} edges={[]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: scrollBottomPad, paddingTop: insets.top },
          ]}
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
          <HomeHeader user={user} alertCount={0} onBellPress={() => {}} />
          <Text style={styles.screenTitle}>{t('tabs.shift')}</Text>

          {!canManage ? (
            <View style={styles.bannerWrap}>
              <ViewOnlyBanner />
            </View>
          ) : null}

          {errorIsNetwork ? (
            <NetworkErrorPanel message={error} onRetry={() => void load()} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          {loading && !form ? (
            <ActivityIndicator color={palette.teal} style={styles.loader} />
          ) : null}

          {form && globalSettings ? (
            <>
              <ShiftHeroCard schedule={form} />
              <HomeGlassCard>
                <Text style={styles.sectionTitle}>
                  {t('settings.workingDaysSection')}
                </Text>
                <WorkingDayPills
                  value={form.workingDays}
                  onChange={(days) => {
                    setForm({ ...form, workingDays: days });
                    setFieldErrors({});
                  }}
                  disabled={!canManage}
                />
                {fieldErrors.form ? (
                  <Text style={styles.inlineError}>
                    {t(`settings.validation.${fieldErrors.form}`)}
                  </Text>
                ) : null}
              </HomeGlassCard>

              <ShiftZonesCard
                value={form}
                onChange={(next) => {
                  setForm((prev) => (prev ? applyShiftScheduleUpdate(prev, next) : prev));
                  setFieldErrors({});
                }}
                errors={fieldErrors}
                readOnly={!canManage}
              />

              {canManage ? (
                <Pressable
                  style={[
                    styles.saveBtn,
                    { backgroundColor: palette.teal },
                    saving && styles.saveDisabled,
                  ]}
                  disabled={saving}
                  onPress={onSavePress}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>{t('settings.save')}</Text>
                  )}
                </Pressable>
              ) : null}

              <CustomScheduleListCard
                users={users}
                globalSettings={globalSettings}
                onPressUser={(deviceUserId, name) =>
                  navigateToEmployeeDetail(navigation, { deviceUserId, name })
                }
              />
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? HOME_BG_DARK : HOME_BG_LIGHT,
    },
    safe: { flex: 1, backgroundColor: 'transparent' },
    scroll: { paddingHorizontal: 16, gap: 16 },
    screenTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 28,
      lineHeight: 36,
      color: text,
      marginBottom: 4,
    },
    bannerWrap: { marginTop: -8 },
    sectionTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
      marginBottom: 12,
    },
    error: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: '#EF4444',
    },
    success: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: '#059669',
    },
    inlineError: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: '#EF4444',
      marginTop: 8,
    },
    loader: { marginVertical: 24 },
    saveBtn: {
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveDisabled: { opacity: 0.7 },
    saveText: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: '#FFFFFF',
    },
  });
}
