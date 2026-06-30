export const CAME_VIA_SOURCES = [
  'social_media',
  'telegram_groups',
  'brochure',
  'street_ads',
  'friends',
] as const;

export type CameViaSource = (typeof CAME_VIA_SOURCES)[number];

export function isCameViaSource(value: string): value is CameViaSource {
  return (CAME_VIA_SOURCES as readonly string[]).includes(value);
}

export function buildCameViaValue(source: CameViaSource, friendDetail?: string): string {
  if (source === 'friends') {
    const name = friendDetail?.trim();
    return name ? `friends:${name}` : 'friends';
  }
  return source;
}

export function parseCameViaValue(value: string | null | undefined): {
  source: CameViaSource | '';
  friendDetail: string;
} {
  if (!value) {
    return { source: '', friendDetail: '' };
  }

  if (value.startsWith('friends:')) {
    return { source: 'friends', friendDetail: value.slice('friends:'.length) };
  }

  if (isCameViaSource(value)) {
    return { source: value, friendDetail: '' };
  }

  return { source: '', friendDetail: '' };
}

type TranslateFn = (key: string, values?: Record<string, string>) => string;

export function formatCameViaValue(
  value: string | null | undefined,
  t: TranslateFn,
): string {
  if (!value?.trim()) {
    return t('noComeViaWho');
  }

  const { source, friendDetail } = parseCameViaValue(value);

  if (source === 'friends') {
    const label = t('cameViaOptions.friends');
    return friendDetail ? `${label}: ${friendDetail}` : label;
  }

  if (source) {
    return t(`cameViaOptions.${source}`);
  }

  return value;
}
