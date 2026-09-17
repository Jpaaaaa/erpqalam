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

export type RtlSyncResult = 'ok' | 'reloading' | 'needs_restart';

function applyForceRtl(wantRtl: boolean): void {
  I18nManager.allowRTL(true);
  if (wantRtl !== I18nManager.isRTL) {
    I18nManager.forceRTL(wantRtl);
  }
}

/**
 * Boot path: JS-mirror-first. Never reload or show RestartRequiredScreen.
 * forceRTL prepares the next cold start; layout uses needsJsMirror until then.
 */
export async function syncNativeRtlBoot(wantRtl: boolean): Promise<'ok'> {
  if (isExpoGo()) {
    return 'ok';
  }

  applyForceRtl(wantRtl);
  return 'ok';
}

/**
 * Language-switch path. ku↔ar stays ok (both RTL). LTR↔RTL needs native flip:
 * release → one guarded reloadAsync; dev client → RestartRequiredScreen (no reload).
 */
export async function syncNativeRtlSwitch(
  wantRtl: boolean,
): Promise<RtlSyncResult> {
  I18nManager.allowRTL(true);

  if (isExpoGo()) {
    return 'ok';
  }

  if (wantRtl === I18nManager.isRTL) {
    await AsyncStorage.removeItem(RTL_RELOAD_ATTEMPTED_KEY);
    return 'ok';
  }

  const reloadAlreadyTried =
    (await AsyncStorage.getItem(RTL_RELOAD_ATTEMPTED_KEY)) === '1';

  const plan = planRtlSync({
    wantRtl,
    nativeRtl: I18nManager.isRTL,
    isExpoGo: false,
    isDevClient: __DEV__,
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
    } catch {
      await AsyncStorage.removeItem(RTL_RELOAD_ATTEMPTED_KEY);
      return 'needs_restart';
    }
  }

  return 'needs_restart';
}
