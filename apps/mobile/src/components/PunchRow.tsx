import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PunchTypeBadge } from './PunchTypeBadge';
import {
  formatDisplayDate,
  formatDisplayTime,
} from '../attendance/formatters';
import type { AttendanceRecord } from '../types/attendance';
import { useI18n } from '../i18n/I18nProvider';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';
import { mirroredRow } from '../ui/rtlLayout';

export function PunchRow({
  record,
  name,
  deviceName,
  onPress,
}: {
  record: AttendanceRecord;
  name: string;
  deviceName: string;
  onPress?: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { isRtl, mirrorLayout } = useI18n();
  const content = (
    <View style={styles.card}>
      <AppText style={styles.name}>{name}</AppText>
      <AppText style={[styles.id, ltrText]}>{record.deviceUserId}</AppText>
      <View style={[styles.meta, mirroredRow(mirrorLayout)]}>
        <AppText style={styles.metaText}>
          {t('records.date')}{' '}
          <AppText style={[styles.metaText, ltrText]}>
            {formatDisplayDate(record.timestamp.slice(0, 10))}
          </AppText>
        </AppText>
        <AppText style={styles.metaText}>
          {t('records.time')}{' '}
          <AppText style={[styles.metaText, ltrText]}>
            {formatDisplayTime(record.timestamp)}
          </AppText>
        </AppText>
      </View>
      <View style={[styles.footer, mirroredRow(mirrorLayout)]}>
        <PunchTypeBadge punchType={record.punchType} />
        <AppText
          style={[styles.device, { textAlign: isRtl ? 'left' : 'right' }]}
          numberOfLines={1}
        >
          {t('records.device')} {deviceName}
        </AppText>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  id: { fontSize: 13, color: '#64748b', marginTop: 2 },
  meta: { gap: 12, marginTop: 8 },
  metaText: { fontSize: 13, color: '#475569' },
  footer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  device: { flex: 1, fontSize: 12, color: '#94a3b8' },
});
