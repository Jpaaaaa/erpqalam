import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  getQuickRange,
  isFilterActive,
} from '../../attendance/formatters';
import type { DateFilter, QuickRangeKey } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import { DateFieldPicker } from '../CalendarDatePicker';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
} from '../home/homeGlass';

const RANGE_KEYS: QuickRangeKey[] = ['today', 'yesterday', 'week', 'month'];

const RANGE_LABEL: Record<QuickRangeKey, string> = {
  today: 'dateFilter.today',
  yesterday: 'dateFilter.yesterday',
  week: 'dateFilter.thisWeek',
  month: 'dateFilter.thisMonth',
};

function isCustomRange(filter: DateFilter): boolean {
  return !RANGE_KEYS.some((key) => isFilterActive(filter, key));
}

export function RecordsDateChips({
  filter,
  onChange,
}: {
  filter: DateFilter;
  onChange: (filter: DateFilter) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const [customOpen, setCustomOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(filter.fromDate);
  const [draftTo, setDraftTo] = useState(filter.toDate);
  const customActive = isCustomRange(filter);

  function openCustom() {
    setDraftFrom(filter.fromDate);
    setDraftTo(filter.toDate);
    setCustomOpen(true);
  }

  function applyCustom() {
    onChange({ fromDate: draftFrom, toDate: draftTo });
    setCustomOpen(false);
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, mirroredRow(mirrorLayout)]}
      >
        {RANGE_KEYS.map((key) => {
          const active = isFilterActive(filter, key);
          return (
            <Pressable
              key={key}
              onPress={() => {
                const next = getQuickRange(key);
                onChange({ fromDate: next.from, toDate: next.to });
              }}
              style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {t(RANGE_LABEL[key])}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={openCustom}
          style={[styles.chip, customActive ? styles.chipActive : styles.chipGlass]}
        >
          <Text style={[styles.chipText, customActive && styles.chipTextActive]} numberOfLines={1}>
            {t('dateFilter.custom')}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={customOpen} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setCustomOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <DateFieldPicker
              label={t('dateFilter.from')}
              value={draftFrom}
              onChange={setDraftFrom}
            />
            <DateFieldPicker
              label={t('dateFilter.to')}
              value={draftTo}
              onChange={setDraftTo}
            />
            <Pressable style={[styles.applyBtn, { backgroundColor: palette.teal }]} onPress={applyCustom}>
              <Text style={styles.applyText}>{t('dateFilter.apply')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const glassFill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const glassBorder = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const muted = isDark ? '#94A3B8' : '#475569';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 4,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    chipGlass: {
      backgroundColor: glassFill,
      borderColor: glassBorder,
    },
    chipActive: {
      backgroundColor: '#14B8A6',
      borderColor: '#14B8A6',
    },
    chipText: {
      fontFamily: typography.noto.bold,
      fontSize: 13,
      lineHeight: 18,
      color: muted,
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: isDark ? '#1F2630' : '#FFFFFF',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      paddingBottom: 28,
    },
    applyBtn: {
      marginTop: 16,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    applyText: {
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: '#FFFFFF',
    },
  });
}
