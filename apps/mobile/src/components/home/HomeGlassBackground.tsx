import { Dimensions, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { HOME_BG_DARK, HOME_BG_LIGHT } from './homeGlass';

/** Full display height so gradients extend under the status bar. */
const SCREEN_H = Dimensions.get('screen').height;

/** ~1.2× screen width diameter */
function blobRadius(width: number) {
  return width * 0.6;
}

export function HomeGlassBackground({ isDark }: { isDark: boolean }) {
  const { width: W } = useWindowDimensions();
  const centerOpacity = isDark ? 0.12 : 0.18;
  const BLOB_R = blobRadius(W);

  return (
    <View style={styles.root} pointerEvents="none">
      <View
        style={[
          styles.base,
          { backgroundColor: isDark ? HOME_BG_DARK : HOME_BG_LIGHT },
        ]}
      />
      <Svg width={W} height={SCREEN_H} style={styles.svg}>
        <Defs>
          <RadialGradient id="blobTeal" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#14B8A6" stopOpacity={centerOpacity} />
            <Stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="blobViolet" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity={centerOpacity} />
            <Stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="blobBlue" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity={centerOpacity} />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {/* Teal — top-right */}
        <Circle cx={W * 0.92} cy={SCREEN_H * 0.06} r={BLOB_R} fill="url(#blobTeal)" />
        {/* Violet — middle-left */}
        <Circle cx={W * 0.02} cy={SCREEN_H * 0.42} r={BLOB_R} fill="url(#blobViolet)" />
        {/* Blue — bottom-right */}
        <Circle cx={W * 0.95} cy={SCREEN_H * 0.88} r={BLOB_R} fill="url(#blobBlue)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFill,
  },
  svg: {
    ...StyleSheet.absoluteFill,
  },
});
