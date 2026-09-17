/**
 * Decide how to apply a layout-direction change.
 *
 * `Updates.reloadAsync()` reloads JS. `I18nManager.forceRTL()` only takes
 * effect after a native activity restart. In Expo Go those are not the same
 * thing — calling reload there can remount JS with the old direction (half-flipped
 * UI) or loop. Boot never calls this; switch returns early in Expo Go before planning.
 */
export type RtlSyncPlan =
  | { action: 'ok' }
  | { action: 'force_and_reload' }
  | {
      action: 'force_and_prompt_restart';
      reason:
        | 'expo_go'
        | 'dev_client'
        | 'reload_already_tried'
        | 'reload_unavailable';
    };

export function planRtlSync(opts: {
  wantRtl: boolean;
  nativeRtl: boolean;
  isExpoGo: boolean;
  /** Local expo-dev-client — never reloadAsync (crashes DevLauncher). */
  isDevClient: boolean;
  updatesEnabled: boolean;
  reloadAlreadyTried: boolean;
}): RtlSyncPlan {
  if (opts.wantRtl === opts.nativeRtl) {
    return { action: 'ok' };
  }
  if (opts.isExpoGo) {
    return { action: 'force_and_prompt_restart', reason: 'expo_go' };
  }
  if (opts.isDevClient) {
    return { action: 'force_and_prompt_restart', reason: 'dev_client' };
  }
  if (!opts.updatesEnabled) {
    return { action: 'force_and_prompt_restart', reason: 'reload_unavailable' };
  }
  if (opts.reloadAlreadyTried) {
    return { action: 'force_and_prompt_restart', reason: 'reload_already_tried' };
  }
  return { action: 'force_and_reload' };
}
