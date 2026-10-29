import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '../ui/AppText';

export function OfflineBanner() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    void NetInfo.fetch().then((state) => {
      setOffline(state.isConnected === false || state.isInternetReachable === false);
    });
    return unsub;
  }, []);

  if (!offline) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 4 }]}>
      <AppText style={styles.text}>{t('common:offlineBanner')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#78350f',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
