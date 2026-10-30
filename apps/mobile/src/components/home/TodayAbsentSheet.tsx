import { useMemo, useRef } from 'react';
import {
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TodayAbsentEmployee } from '../../attendance/todayAbsent';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import {
  GLASS_MUTED_DARK,
  GLASS_MUTED_LIGHT,
  TAB_BAR_SOLID_DARK,
  TAB_BAR_SOLID_LIGHT,
} from '../home/homeGlass';

const SHEET_MAX_RATIO = 0.7;
const SHEET_TOP_RADIUS = 28;
const BACKDROP_COLOR = 'rgba(15, 23, 42, 0.45)';
const SWIPE_CLOSE_DY = 56;

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

type Props = {
  visible: boolean;
  items: TodayAbsentEmployee[];
  isOffDay: boolean;
  onClose: () => void;
  onSelectEmployee: (deviceUserId: string, name: string) => void;
};

export function TodayAbsentSheet({
  visible,
  items,
  isOffDay,
  onClose,
  onSelectEmployee,
}: Props) {
  const { t } = useTranslation(['attendance', 'common']);
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(isDark, typography), [isDark, typography]);
  const maxSheetHeight = Dimensions.get('window').height * SHEET_MAX_RATIO;
  const sheetBottomPad = Math.max(insets.bottom, 16);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > SWIPE_CLOSE_DY) {
          onClose();
        }
      },
    }),
  ).current;

  const count = items.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdropTap}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common:close')}
        />
        <View
          style={[
            styles.sheet,
            { maxHeight: maxSheetHeight, paddingBottom: sheetBottomPad },
          ]}
        >
          <View style={styles.handleWrap} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <View style={[styles.header, mirroredRow(mirrorLayout)]}>
            <Text style={styles.title} numberOfLines={1}>
              {t('home.todayAbsentFooterLabel')}
            </Text>
            {count > 0 ? (
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{`\u2066${count}\u2069`}</Text>
              </View>
            ) : null}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel={t('common:close')}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={22}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </Pressable>
          </View>
          <ScrollView
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              count === 0 && styles.listContentEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            bounces
          >
            {count === 0 ? (
              <Text style={styles.emptyMessage}>
                {isOffDay
                  ? t('home.todayAbsentEmptyOffDay')
                  : t('home.todayAbsentEmptyAllPresent')}
              </Text>
            ) : (
              items.map((item, index) => (
                <AbsentRow
                  key={item.deviceUserId}
                  item={item}
                  isLast={index === items.length - 1}
                  mirrorLayout={mirrorLayout}
                  typography={typography}
                  styles={styles}
                  onPress={() => {
                    onClose();
                    onSelectEmployee(item.deviceUserId, item.name);
                  }}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AbsentRow({
  item,
  isLast,
  mirrorLayout,
  typography,
  styles,
  onPress,
}: {
  item: TodayAbsentEmployee;
  isLast: boolean;
  mirrorLayout: boolean;
  typography: AppTypography;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  const initial = (item.name.trim().charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.rowInner, mirroredRow(mirrorLayout)]}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarLetter, { fontFamily: initialFont }]}>
            {initial}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.idLine} numberOfLines={1}>
          <Text style={styles.idHash}>#</Text>
          <Text style={styles.idNum}>{item.deviceUserId}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const sheetBg = isDark ? TAB_BAR_SOLID_DARK : TAB_BAR_SOLID_LIGHT;
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: BACKDROP_COLOR,
    },
    backdropTap: {
      flex: 1,
      width: '100%',
    },
    sheet: {
      borderTopLeftRadius: SHEET_TOP_RADIUS,
      borderTopRightRadius: SHEET_TOP_RADIUS,
      backgroundColor: sheetBg,
      opacity: 1,
      overflow: 'hidden',
    },
    handleWrap: {
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 6,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(15, 23, 42, 0.15)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    title: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 17,
      lineHeight: 24,
      color: text,
    },
    countPill: {
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      minWidth: 32,
      alignItems: 'center',
    },
    countPillText: {
      fontFamily: typography.inter.bold,
      fontSize: 13,
      lineHeight: 18,
      color: '#DC2626',
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.06)',
    },
    closeBtnPressed: { opacity: 0.75 },
    list: {
      flexGrow: 0,
    },
    listContent: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    listContentEmpty: {
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    emptyMessage: {
      fontFamily: typography.noto.medium,
      fontSize: 15,
      lineHeight: 24,
      color: muted,
      textAlign: 'center',
    },
    row: {
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    rowPressed: { opacity: 0.88 },
    rowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 16,
      lineHeight: 20,
      color: '#DC2626',
    },
    name: {
      flex: 1,
      minWidth: 0,
      fontFamily: typography.noto.bold,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '600',
      color: text,
    },
    idLine: {
      flexShrink: 0,
      maxWidth: 88,
    },
    idHash: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      color: muted,
    },
    idNum: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      color: muted,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
  });
}
