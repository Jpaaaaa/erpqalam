import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { AttendanceHolidayType, AttendanceUser } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { DateFieldPicker } from '../CalendarDatePicker';
import { ReportEmployeePickerRow } from '../report/ReportEmployeePickerRow';
import { HolidaysStepper } from './HolidaysStepper';
import { holidayTypeColor, holidayTypeTileBg } from './holidayColors';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FALLBACK_DARK,
  GLASS_FALLBACK_LIGHT,
  GLASS_RADIUS,
} from '../home/homeGlass';
import type { HolidaysTabKey } from './HolidaysTabSegment';

const ORG_TYPES: AttendanceHolidayType[] = ['day_off', 'entry_late', 'early_exit'];

const TYPE_ICON: Record<AttendanceHolidayType, keyof typeof Ionicons.glyphMap> = {
  day_off: 'moon-outline',
  entry_late: 'time-outline',
  early_exit: 'exit-outline',
};

type Props = {
  visible: boolean;
  tab: HolidaysTabKey;
  onClose: () => void;
  orgType: AttendanceHolidayType;
  onOrgTypeChange: (t: AttendanceHolidayType) => void;
  orgFrom: string;
  orgTo: string;
  onOrgFromChange: (d: string) => void;
  onOrgToChange: (d: string) => void;
  onSubmitOrg: () => void;
  users: AttendanceUser[];
  empUserId: string;
  onEmpUserIdChange: (id: string) => void;
  empFrom: string;
  empTo: string;
  onEmpFromChange: (d: string) => void;
  onEmpToChange: (d: string) => void;
  onSubmitEmp: () => void;
  balanceUserId: string;
  onBalanceUserIdChange: (id: string) => void;
  balanceDays: number;
  onBalanceDaysChange: (d: number) => void;
  onSubmitBalance: () => void;
};

export function HolidaysAddSheet(props: Props) {
  const { visible, tab, onClose } = props;
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const title =
    tab === 'official'
      ? t('holidays.addOrg')
      : tab === 'employee'
        ? t('holidays.addEmp')
        : tab === 'settings'
          ? t('holidays.setBalance')
          : t('holidays.timeLeaveHint');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {tab === 'official' ? (
              <>
                <View style={styles.typeCards}>
                  {ORG_TYPES.map((type) => {
                    const active = props.orgType === type;
                    const color = holidayTypeColor(type);
                    return (
                      <Pressable
                        key={type}
                        onPress={() => props.onOrgTypeChange(type)}
                        style={[
                          styles.typeCard,
                          active && { borderColor: color, borderWidth: 2 },
                          { backgroundColor: holidayTypeTileBg(type, isDark) },
                        ]}
                      >
                        <Ionicons name={TYPE_ICON[type]} size={24} color={color} />
                        <Text style={styles.typeCardLabel} numberOfLines={2}>
                          {t(`holidays.types.${type}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <DateFieldPicker
                  label={t('holidays.dateFrom')}
                  value={props.orgFrom}
                  onChange={props.onOrgFromChange}
                />
                <DateFieldPicker
                  label={t('holidays.dateTo')}
                  value={props.orgTo}
                  onChange={props.onOrgToChange}
                  optional
                />
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: palette.teal }]}
                  onPress={() => props.onSubmitOrg()}
                >
                  <Text style={styles.primaryText}>{t('holidays.addOrg')}</Text>
                </Pressable>
              </>
            ) : null}

            {tab === 'employee' ? (
              <>
                <ReportEmployeePickerRow
                  users={props.users}
                  value={props.empUserId}
                  onChange={props.onEmpUserIdChange}
                />
                <DateFieldPicker
                  label={t('holidays.dateFrom')}
                  value={props.empFrom}
                  onChange={props.onEmpFromChange}
                />
                <DateFieldPicker
                  label={t('holidays.dateTo')}
                  value={props.empTo}
                  onChange={props.onEmpToChange}
                  optional
                />
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: palette.teal }]}
                  onPress={() => props.onSubmitEmp()}
                >
                  <Text style={styles.primaryText}>{t('holidays.addEmp')}</Text>
                </Pressable>
              </>
            ) : null}

            {tab === 'settings' ? (
              <>
                <ReportEmployeePickerRow
                  users={props.users}
                  value={props.balanceUserId}
                  onChange={props.onBalanceUserIdChange}
                />
                <HolidaysStepper
                  label={t('holidays.balanceDays')}
                  value={props.balanceDays}
                  onChange={props.onBalanceDaysChange}
                  min={0}
                  max={365}
                />
                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: palette.teal }]}
                  onPress={() => props.onSubmitBalance()}
                >
                  <Text style={styles.primaryText}>{t('holidays.setBalance')}</Text>
                </Pressable>
              </>
            ) : null}

            {tab === 'temporary' ? (
              <Text style={styles.hint}>{t('holidays.timeLeaveHint')}</Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const sheetBg = isDark ? GLASS_FALLBACK_DARK : GLASS_FALLBACK_LIGHT;

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    sheet: {
      maxHeight: '88%',
      borderTopLeftRadius: GLASS_RADIUS,
      borderTopRightRadius: GLASS_RADIUS,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 28,
      backgroundColor: sheetBg,
      borderWidth: 1,
      borderColor: isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT,
      borderBottomWidth: 0,
    },
    sheetTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 18,
      color: text,
      marginBottom: 12,
    },
    scroll: { maxHeight: 520 },
    typeCards: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
    },
    typeCard: {
      width: '31%',
      flexGrow: 1,
      minWidth: 100,
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    typeCardLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 11,
      textAlign: 'center',
      color: text,
    },
    primaryBtn: {
      marginTop: 16,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primaryText: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: '#FFFFFF',
    },
    hint: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: muted,
      lineHeight: 22,
    },
  });
}
