import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { displayName } from '../attendance/formatters';
import type { AttendanceUser } from '../types/attendance';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { ltrText } from '../ui/ltr';
import { mirroredRow } from '../ui/rtlLayout';
import { RecordsSearchField } from './records/RecordsSearchField';
import {
  GLASS_MUTED_DARK,
  GLASS_MUTED_LIGHT,
  TAB_BAR_SOLID_DARK,
  TAB_BAR_SOLID_LIGHT,
} from './home/homeGlass';

const SHEET_HEIGHT_RATIO = 0.75;
const SHEET_TOP_RADIUS = 28;
const BACKDROP_COLOR = 'rgba(15, 23, 42, 0.45)';
const SWIPE_CLOSE_DY = 56;

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

type Props = {
  visible: boolean;
  users: AttendanceUser[];
  value: string;
  onClose: () => void;
  onSelect: (deviceUserId: string) => void;
};

export function EmployeeSelectSheet({
  visible,
  users,
  value,
  onClose,
  onSelect,
}: Props) {
  const { t } = useTranslation(['attendance', 'common']);
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(isDark, typography), [isDark, typography]);
  const sheetHeight = Dimensions.get('window').height * SHEET_HEIGHT_RATIO;
  const sheetBottomPad = Math.max(insets.bottom, 16);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.deviceUserId.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q),
    );
  }, [users, search]);

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

  function handleSelect(deviceUserId: string) {
    onSelect(deviceUserId);
    setSearch('');
    onClose();
  }

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
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common:close')}
        />
        <View
          style={[
            styles.sheet,
            { height: sheetHeight, paddingBottom: sheetBottomPad },
          ]}
        >
          <View style={styles.handleWrap} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <View style={[styles.header, mirroredRow(mirrorLayout)]}>
            <Text style={styles.title} numberOfLines={1}>
              {t('report.selectEmployee')}
            </Text>
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
          <View style={styles.searchWrap}>
            <RecordsSearchField
              value={search}
              onChangeText={setSearch}
              placeholder={t('report.searchPlaceholder')}
            />
          </View>
          <FlatList
            style={styles.list}
            data={filtered}
            keyExtractor={(item) => item.deviceUserId}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <EmployeeRow
                item={item}
                selected={item.deviceUserId === value}
                mirrorLayout={mirrorLayout}
                typography={typography}
                styles={styles}
                onPress={() => handleSelect(item.deviceUserId)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>{t('employees.empty')}</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

function EmployeeRow({
  item,
  selected,
  mirrorLayout,
  typography,
  styles,
  onPress,
}: {
  item: AttendanceUser;
  selected: boolean;
  mirrorLayout: boolean;
  typography: AppTypography;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  const name = displayName(item.name, item.deviceUserId);
  const initial = (name.charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.rowInner, mirroredRow(mirrorLayout)]}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarLetter, { fontFamily: initialFont }]}>
            {initial}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.idLine} numberOfLines={1}>
          <Text style={styles.idHash}>#</Text>
          <Text style={styles.idNum}>{item.deviceUserId}</Text>
        </Text>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color="#14B8A6" />
        ) : (
          <View style={styles.checkPlaceholder} />
        )}
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
    sheet: {
      borderTopLeftRadius: SHEET_TOP_RADIUS,
      borderTopRightRadius: SHEET_TOP_RADIUS,
      backgroundColor: sheetBg,
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
      paddingBottom: 8,
    },
    title: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 17,
      lineHeight: 24,
      color: text,
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
    searchWrap: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    empty: {
      textAlign: 'center',
      color: muted,
      marginTop: 24,
      fontFamily: typography.noto.medium,
      fontSize: 15,
    },
    row: {
      paddingVertical: 10,
      paddingHorizontal: 8,
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
      backgroundColor: isDark ? 'rgba(20, 184, 166, 0.28)' : 'rgba(20, 184, 166, 0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 16,
      lineHeight: 20,
      color: '#14B8A6',
    },
    name: {
      flex: 1,
      minWidth: 0,
      fontFamily: typography.noto.bold,
      fontSize: 15,
      lineHeight: 22,
      color: text,
    },
    idLine: {
      flexShrink: 0,
      maxWidth: 72,
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
    checkPlaceholder: {
      width: 22,
      height: 22,
    },
  });
}
