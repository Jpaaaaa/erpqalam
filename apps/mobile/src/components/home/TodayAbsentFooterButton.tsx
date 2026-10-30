import { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

const GRADIENT = ['#14B8A6', '#0D9488'] as const;

type Props = {
  count: number;
  onPress: () => void;
};

export function TodayAbsentFooterButton({ count, onPress }: Props) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const scale = useRef(new Animated.Value(1)).current;
  const styles = createStyles(typography);

  function pressIn() {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }

  function pressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  }

  function handlePress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="button"
      accessibilityLabel={t('home.todayAbsentFooterLabel')}
    >
      <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={[...GRADIENT]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.gradient, mirroredRow(mirrorLayout)]}
        >
          <Ionicons name="people-outline" size={22} color="#FFFFFF" />
          <Text style={styles.label} numberOfLines={1}>
            {t('home.todayAbsentFooterLabel')}
          </Text>
          {count > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{`\u2066${count}\u2069`}</Text>
            </View>
          ) : (
            <View style={styles.badgePlaceholder} />
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function createStyles(typography: AppTypography) {
  return StyleSheet.create({
    wrap: {
      width: '100%',
      borderRadius: 24,
      overflow: 'hidden',
    },
    gradient: {
      height: 64,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      gap: 12,
    },
    label: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '800',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    badge: {
      backgroundColor: '#FFFFFF',
      minWidth: 36,
      height: 32,
      borderRadius: 16,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontFamily: typography.inter.extraBold,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
      color: '#DC2626',
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    badgePlaceholder: {
      width: 36,
      height: 32,
    },
  });
}
