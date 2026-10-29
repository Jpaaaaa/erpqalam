import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  joinWallClockHour12,
  splitWallClockHour12,
  splitWallClockTime,
} from '../../attendance/wallClockTime';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FALLBACK_DARK,
  GLASS_FALLBACK_LIGHT,
  GLASS_RADIUS,
} from '../home/homeGlass';
import { usePickerOpenSync } from './usePickerOpenSync';

const PAD = 2;
/** Clock order: 12, 1, 2, … 11 */
const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const ROW_H = 44;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function indexFromOffset(offsetY: number, maxIndex: number): number {
  return clamp(Math.round(offsetY / ROW_H) - PAD, 0, maxIndex);
}

function scrollYForIndex(index: number): number {
  return (index + PAD) * ROW_H;
}

export type WallClockTimePickerWheelProps = {
  visible: boolean;
  title: string;
  value: string;
  onChange: (time: string) => void;
  onClose: () => void;
};

/** JS-only fallback when RNCDatePicker is not in the native binary. */
export function WallClockTimePickerWheel({
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

  const amLabel = t('settings.timeAm');
  const pmLabel = t('settings.timePm');

  const initial24 = splitWallClockTime(value || '08:00');
  const initial12 = splitWallClockHour12(initial24.hour);
  const [hour12, setHour12] = useState(initial12.hour12);
  const [pm, setPm] = useState(initial12.pm);
  const [minute, setMinute] = useState(initial24.minute);
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);
  const periodRef = useRef<ScrollView>(null);

  const syncFromValue = useCallback(() => {
    const p24 = splitWallClockTime(value || '08:00');
    const p12 = splitWallClockHour12(p24.hour);
    const hourIndex = HOURS_12.indexOf(p12.hour12);
    setHour12(p12.hour12);
    setPm(p12.pm);
    setMinute(p24.minute);
    requestAnimationFrame(() => {
      hourRef.current?.scrollTo({
        y: scrollYForIndex(hourIndex >= 0 ? hourIndex : 0),
        animated: false,
      });
      minuteRef.current?.scrollTo({ y: scrollYForIndex(p24.minute), animated: false });
      periodRef.current?.scrollTo({
        y: scrollYForIndex(p12.pm ? 1 : 0),
        animated: false,
      });
    });
  }, [value]);

  usePickerOpenSync(visible, syncFromValue);

  function confirm() {
    onChange(joinWallClockHour12(hour12, minute, pm));
    onClose();
  }

  function onHourScroll(offsetY: number) {
    const idx = indexFromOffset(offsetY, HOURS_12.length - 1);
    setHour12(HOURS_12[idx]!);
  }

  function onMinuteScroll(offsetY: number) {
    const idx = indexFromOffset(offsetY, MINUTES.length - 1);
    setMinute(MINUTES[idx]!);
  }

  function onPeriodScroll(offsetY: number) {
    const idx = indexFromOffset(offsetY, 1);
    setPm(idx === 1);
  }

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdropHit} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.wheels}>
            <ScrollView
              ref={hourRef}
              style={styles.wheelHour}
              showsVerticalScrollIndicator={false}
              snapToInterval={ROW_H}
              decelerationRate="fast"
              nestedScrollEnabled
              onScroll={(e) => onHourScroll(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => onHourScroll(e.nativeEvent.contentOffset.y)}
            >
              <View style={styles.pad} />
              {HOURS_12.map((h) => (
                <View key={h} style={styles.row}>
                  <Text style={[styles.rowText, ltrText, hour12 === h && styles.rowActive]}>
                    {String(h)}
                  </Text>
                </View>
              ))}
              <View style={styles.pad} />
            </ScrollView>
            <Text style={[styles.colon, ltrText]}>:</Text>
            <ScrollView
              ref={minuteRef}
              style={styles.wheelMinute}
              showsVerticalScrollIndicator={false}
              snapToInterval={ROW_H}
              decelerationRate="fast"
              nestedScrollEnabled
              onScroll={(e) => onMinuteScroll(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => onMinuteScroll(e.nativeEvent.contentOffset.y)}
            >
              <View style={styles.pad} />
              {MINUTES.map((m) => (
                <View key={m} style={styles.row}>
                  <Text
                    style={[styles.rowText, ltrText, minute === m && styles.rowActive]}
                  >
                    {String(m).padStart(2, '0')}
                  </Text>
                </View>
              ))}
              <View style={styles.pad} />
            </ScrollView>
            <ScrollView
              ref={periodRef}
              style={styles.wheelPeriod}
              showsVerticalScrollIndicator={false}
              snapToInterval={ROW_H}
              decelerationRate="fast"
              nestedScrollEnabled
              onScroll={(e) => onPeriodScroll(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => onPeriodScroll(e.nativeEvent.contentOffset.y)}
            >
              <View style={styles.pad} />
              <View style={styles.row}>
                <Text style={[styles.rowText, ltrText, !pm && styles.rowActive]}>{amLabel}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowText, ltrText, pm && styles.rowActive]}>{pmLabel}</Text>
              </View>
              <View style={styles.pad} />
            </ScrollView>
            <View style={styles.selectionBand} pointerEvents="none" />
          </View>
          <Pressable
            style={[styles.doneBtn, { backgroundColor: palette.teal }]}
            onPress={confirm}
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
      paddingHorizontal: 16,
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
      marginBottom: 12,
      textAlign: 'center',
    },
    wheels: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: ROW_H * 5,
      marginBottom: 16,
    },
    wheelHour: { width: 56, height: ROW_H * 5 },
    wheelMinute: { width: 64, height: ROW_H * 5 },
    wheelPeriod: { width: 52, height: ROW_H * 5, marginStart: 6 },
    colon: {
      fontFamily: typography.inter.bold,
      fontSize: 22,
      color: text,
      marginHorizontal: 4,
    },
    row: {
      height: ROW_H,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: {
      fontFamily: typography.inter.semibold,
      fontSize: 20,
      color: isDark ? '#64748B' : '#94A3B8',
      fontVariant: ['tabular-nums'],
    },
    rowActive: { color: text, fontSize: 22 },
    pad: { height: ROW_H * PAD },
    selectionBand: {
      position: 'absolute',
      left: 8,
      right: 8,
      top: ROW_H * PAD,
      height: ROW_H,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(20, 184, 166, 0.35)',
      backgroundColor: 'rgba(20, 184, 166, 0.08)',
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
