import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { MoreStackParamList } from '../navigation/types';
import { AppText } from '../ui/AppText';
import { useI18n } from '../i18n/I18nProvider';
import { mirroredRow } from '../ui/rtlLayout';

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
  const { mirrorLayout } = useI18n();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AppText style={styles.hint}>{t('more.subtitle')}</AppText>
      {ITEMS.filter((item) => !item.manageOnly || canManage).map((item) => (
        <Pressable
          key={item.key}
          style={[styles.row, mirroredRow(mirrorLayout)]}
          onPress={() => navigation.navigate(item.key)}
        >
          <View style={[styles.rowInner, mirroredRow(mirrorLayout)]}>
            <Ionicons name={item.icon} size={22} color="#0f766e" />
            <AppText style={styles.rowLabel}>{t(item.labelKey)}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  hint: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 17, fontWeight: '600', color: '#0f172a' },
});
