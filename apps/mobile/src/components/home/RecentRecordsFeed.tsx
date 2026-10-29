import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AttendanceRecord } from '../../types/attendance';
import { formatDisplayTime } from '../../attendance/formatters';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { AppText } from '../../ui/AppText';
import { ltrText } from '../../ui/ltr';
import { useI18n } from '../../i18n/I18nProvider';
import { mirroredRow } from '../../ui/rtlLayout';
import { rowChevron } from '../../ui/chevronIcons';
import { Ionicons } from '@expo/vector-icons';

function punchLabelKey(
  punchType: AttendanceRecord['punchType'],
): string {
  if (!punchType) return 'punchTypes.unknown';
  return `punchTypes.${punchType}`;
}

export function RecentRecordsFeed({
  records,
  nameLookup,
  onSeeAll,
}: {
  records: AttendanceRecord[];
  nameLookup: Map<string, string>;
  onSeeAll: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, isRtl } = useI18n();
  const rtl = isRtl || mirrorLayout;
  const { palette } = useHomeTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.section}>
      <Pressable
        style={[styles.header, mirroredRow(mirrorLayout)]}
        onPress={onSeeAll}
      >
        <AppText style={styles.title}>{t('home.recentRecords')}</AppText>
        <View style={[styles.seeAll, mirroredRow(mirrorLayout)]}>
          <AppText style={styles.seeAllText}>{t('home.seeAll')}</AppText>
          <Ionicons name={rowChevron(rtl)} size={16} color={palette.teal} />
        </View>
      </Pressable>
      {records.length === 0 ? (
        <AppText style={styles.empty}>{t('home.noRecent')}</AppText>
      ) : (
        records.map((record) => {
          const name =
            nameLookup.get(record.deviceUserId) || record.deviceUserId;
          return (
            <View key={record.id} style={[styles.row, mirroredRow(mirrorLayout)]}>
              <View style={styles.dot} />
              <View style={styles.body}>
                <AppText style={styles.name} numberOfLines={1}>
                  {name}
                </AppText>
                <AppText style={styles.meta} numberOfLines={1}>
                  {t(punchLabelKey(record.punchType))}
                  {' · '}
                  <AppText style={[styles.meta, ltrText]}>
                    {formatDisplayTime(record.timestamp)}
                  </AppText>
                </AppText>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

function createStyles(p: ReturnType<typeof useHomeTheme>['palette']) {
  return StyleSheet.create({
    section: { gap: 8 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    title: { fontSize: 17, fontWeight: '700', color: p.text },
    seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    seeAllText: { fontSize: 13, fontWeight: '600', color: p.teal },
    empty: { fontSize: 14, color: p.textMuted, textAlign: 'center', padding: 16 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: p.border,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: p.teal,
    },
    body: { flex: 1, minWidth: 0 },
    name: { fontSize: 15, fontWeight: '600', color: p.text },
    meta: { fontSize: 12, color: p.textMuted, marginTop: 2 },
  });
}
