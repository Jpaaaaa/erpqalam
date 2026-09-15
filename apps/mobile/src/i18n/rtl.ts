import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RTL_RELOAD_ATTEMPTED_KEY } from './locales';
import { planRtlSync } from './planRtlSync';

/** Expo Go host only — not dev-client or standalone (both use StoreClient/Standalone). */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export async function syncNativeRtl(
  wantRtl: boolean,
): Promise<'ok' | 'reloading' | 'needs_restart'> {
  I18nManager.allowRTL(true);

  if (isExpoGo()) {
    // forceRTL does not persist in the Expo Go host; layout is driven from locale in JS.
    return 'ok';
  }

  const reloadAlreadyTried =
    (await AsyncStorage.getItem(RTL_RELOAD_ATTEMPTED_KEY)) === '1';

  const plan = planRtlSync({
    wantRtl,
    nativeRtl: I18nManager.isRTL,
    isExpoGo: false,
    updatesEnabled: Updates.isEnabled,
    reloadAlreadyTried,
  });

  if (plan.action === 'ok') {
    await AsyncStorage.removeItem(RTL_RELOAD_ATTEMPTED_KEY);
    return 'ok';
  }

  I18nManager.forceRTL(wantRtl);

  if (plan.action === 'force_and_reload') {
    await AsyncStorage.setItem(RTL_RELOAD_ATTEMPTED_KEY, '1');
    try {
      await Updates.reloadAsync();
      return 'reloading';
    } catch (err) {
      console.warn('[i18n] Updates.reloadAsync failed', err);
      await AsyncStorage.removeItem(RTL_RELOAD_ATTEMPTED_KEY);
      return 'needs_restart';
    }
  }

  console.warn(
    `[i18n] native RTL is ${I18nManager.isRTL}, want ${wantRtl}; ` +
      `showing close-and-reopen screen (${plan.reason})`,
  );
  return 'needs_restart';
}
