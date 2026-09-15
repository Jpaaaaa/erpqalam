import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Shown when native layout direction does not yet match the chosen locale.
 * Copy is hardcoded in en/ku/ar and uses the system font so this screen stays
 * readable even if custom fonts never load and i18n is mid-switch.
 *
 * There is no "reload" button: in Expo Go that would be a silent no-op (or a
 * JS remount with the old I18nManager direction). The user must fully close
 * the app — swipe it away from Recents — and tap the icon again.
 */
export function RestartRequiredScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={styles.brand}>ERP Qalam</Text>

        <Text style={styles.en}>
          Fully close this app and open it again to finish switching languages.
        </Text>
        <Text style={styles.hint}>
          Swipe it away from Recents, then tap the app icon. Reloading the JS
          bundle is not enough.
        </Text>

        <Text style={styles.ku}>
          تکایە ئەم ئەپە بە تەواوی دابخە و دووبارە بیکەرەوە بۆ تەواوکردنی گۆڕینی
          زمان.
        </Text>
        <Text style={styles.hint}>
          لە دوایین ئەپەکان لابەری، پاشان ئایکۆنەکەی لێبدە. نوێکردنەوەی لاپەڕەکە
          بەس نییە.
        </Text>

        <Text style={styles.ar}>
          أغلق هذا التطبيق بالكامل ثم افتحه مرة أخرى لإكمال تغيير اللغة.
        </Text>
        <Text style={styles.hint}>
          أزلْه من التطبيقات الأخيرة، ثم اضغط أيقونة التطبيق. إعادة تحميل
          الواجهة لا تكفي.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  box: {
    paddingHorizontal: 24,
    gap: 12,
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  en: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 24,
    writingDirection: 'ltr',
  },
  ku: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 28,
  },
  ar: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 28,
    writingDirection: 'rtl',
  },
  hint: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
});
