import { planRtlSync } from '../src/i18n/planRtlSync';

function assert(cond: unknown, msg: string) {
  if (!cond) {
    throw new Error(msg);
  }
}

assert(
  planRtlSync({
    wantRtl: true,
    nativeRtl: true,
    isExpoGo: false,
    updatesEnabled: false,
    reloadAlreadyTried: false,
  }).action === 'ok',
  'matched direction should be ok',
);

assert(
  planRtlSync({
    wantRtl: false,
    nativeRtl: true,
    isExpoGo: false,
    updatesEnabled: true,
    reloadAlreadyTried: false,
  }).action === 'force_and_reload',
  'standalone/dev client should try reloadAsync once',
);

const already = planRtlSync({
  wantRtl: false,
  nativeRtl: true,
  isExpoGo: false,
  updatesEnabled: true,
  reloadAlreadyTried: true,
});
assert(
  already.action === 'force_and_prompt_restart' &&
    already.reason === 'reload_already_tried',
  'second standalone attempt should prompt, not loop reloadAsync',
);

const disabled = planRtlSync({
  wantRtl: true,
  nativeRtl: false,
  isExpoGo: false,
  updatesEnabled: false,
  reloadAlreadyTried: false,
});
assert(
  disabled.action === 'force_and_prompt_restart' &&
    disabled.reason === 'reload_unavailable',
  'no Updates.reloadAsync → prompt close/reopen',
);

// Expo Go never calls planRtlSync — syncNativeRtl returns 'ok' before planning.
const expoGoPlanner = planRtlSync({
  wantRtl: true,
  nativeRtl: false,
  isExpoGo: true,
  updatesEnabled: true,
  reloadAlreadyTried: false,
});
assert(
  expoGoPlanner.action === 'force_and_prompt_restart' &&
    expoGoPlanner.reason === 'expo_go',
  'planner still documents expo_go path if ever invoked without bypass',
);

console.log('rtl reload plan: ok');
