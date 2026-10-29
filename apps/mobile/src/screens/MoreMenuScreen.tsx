import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { MoreStackParamList } from '../navigation/types';
import { useAuth } from '../auth/context';
import { AppText } from '../ui/AppText';
import { useI18n } from '../i18n/I18nProvider';
import { mirroredRow } from '../ui/rtlLayout';
import { rowChevron } from '../ui/chevronIcons';
import { ltrText } from '../ui/ltr';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreMenu'>;

type MenuItem = {
  key: keyof MoreStackParamList;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  manageOnly?: boolean;
};

const ITEMS: MenuItem[] = [
  { key: 'Daily', labelKey: 'more.daily', icon: 'calendar-outline' },
  { key: 'EmployeeReport', labelKey: 'more.report', icon: 'stats-chart-outline' },
  { key: 'Holidays', labelKey: 'more.holidays', icon: 'sunny-outline' },
  {
    key: 'ManualPunch',
    labelKey: 'more.manual',
    icon: 'create-outline',
    manageOnly: true,
  },
];

export function MoreMenuScreen({ navigation }: Props) {
  const { t } = useTranslation('attendance');
  const canManage = useCanManageAttendance();
  const { user, refreshUser, logout } = useAuth();
  const { mirrorLayout, isRtl } = useI18n();
  const rtl = isRtl || mirrorLayout;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
    : '';

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor="#0f766e"
        />
      }
    >
      {user ? (
        <View style={styles.profile}>
          <AppText style={styles.profileLabel}>{t('more.profile')}</AppText>
          <AppText style={styles.profileName} numberOfLines={1}>
            {displayName}
          </AppText>
          <AppText style={[styles.profileEmail, ltrText]} numberOfLines={1}>
            {user.email}
          </AppText>
        </View>
      ) : null}

      <View style={styles.switcher}>
        <LanguageSwitcher />
      </View>

      <AppText style={styles.hint}>{t('more.subtitle')}</AppText>
      {ITEMS.filter((item) => !item.manageOnly || canManage).map((item) => (
        <Pressable
          key={item.key}
          style={[styles.row, mirroredRow(mirrorLayout)]}
          onPress={() => navigation.navigate(item.key)}
        >
          <View style={[styles.rowInner, mirroredRow(mirrorLayout)]}>
            <Ionicons name={item.icon} size={22} color="#0f766e" />
            <AppText style={styles.rowLabel} numberOfLines={1}>
              {t(item.labelKey)}
            </AppText>
          </View>
          <Ionicons name={rowChevron(rtl)} size={20} color="#94a3b8" />
        </Pressable>
      ))}

      <Pressable style={styles.logoutBtn} onPress={() => void logout()}>
        <AppText style={styles.logoutText}>{t('more.signOut')}</AppText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, backgroundColor: '#fff', flexGrow: 1, paddingBottom: 32 },
  profile: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  profileLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  profileName: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  profileEmail: { fontSize: 14, color: '#475569', marginTop: 2 },
  switcher: { marginBottom: 16 },
  hint: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 17, fontWeight: '600', color: '#0f172a', flex: 1 },
  logoutBtn: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#b91c1c', fontWeight: '600', fontSize: 16 },
});
