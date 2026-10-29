import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import {
  localDateToWallClockTime,
  wallClockTimeToLocalDate,
} from '../../attendance/wallClockTime';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FALLBACK_DARK,
  GLASS_FALLBACK_LIGHT,
  GLASS_RADIUS,
} from '../home/homeGlass';
import type { WallClockTimePickerWheelProps } from './WallClockTimePickerWheel';
import { usePickerOpenSync } from './usePickerOpenSync';

export function WallClockTimePickerNative({
  visible,
  title,
  value,
  onChange,
  onClose,
}: WallClockTimePickerWheelProps) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const [pickerDate, setPickerDate] = useState(() => wallClockTimeToLocalDate(value));

  const syncFromValue = useCallback(() => {
    setPickerDate(wallClockTimeToLocalDate(value));
  }, [value]);

  usePickerOpenSync(visible, syncFromValue);

  function onAndroidChange(event: DateTimePickerEvent, date?: Date) {
    if (event.type === 'set' && date) {
      onChange(localDateToWallClockTime(date));
    }
    onClose();
  }

  function confirmIos() {
    onChange(localDateToWallClockTime(pickerDate));
    onClose();
  }

  if (!visible) {
    return null;
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={pickerDate}
        mode="time"
        is24Hour={false}
        display="clock"
        onChange={onAndroidChange}
      />
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdropHit} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <DateTimePicker
            value={pickerDate}
            mode="time"
            is24Hour={false}
            display="spinner"
            themeVariant={isDark ? 'dark' : 'light'}
            onChange={(_event, date) => {
              if (date) setPickerDate(date);
            }}
            style={styles.iosPicker}
          />
          <Pressable
            style={[styles.doneBtn, { backgroundColor: palette.teal }]}
            onPress={confirmIos}
          >
            <Text style={styles.doneText}>{t('settings.timePickerDone')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const sheetBg = isDark ? GLASS_FALLBACK_DARK : GLASS_FALLBACK_LIGHT;

  return StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdropHit: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
    },
    sheet: {
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
    title: {
      fontFamily: typography.noto.bold,
      fontSize: 17,
      color: text,
      marginBottom: 8,
      textAlign: 'center',
    },
    iosPicker: {
      alignSelf: 'stretch',
      height: 216,
      marginBottom: 16,
    },
    doneBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    doneText: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: '#FFFFFF',
    },
  });
}
