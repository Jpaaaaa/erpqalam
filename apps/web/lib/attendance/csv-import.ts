/** Parse CSV rows: deviceUserId,name (header row optional). */
export function parseEmployeeCsv(text: string): { deviceUserId: string; name: string }[] {
  const rows: { deviceUserId: string; name: string }[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const comma = trimmed.indexOf(',');
    const tab = trimmed.indexOf('\t');
    const sep = comma >= 0 && (tab < 0 || comma < tab) ? comma : tab;

    let deviceUserId: string;
    let name: string;

    if (sep >= 0) {
      deviceUserId = trimmed.slice(0, sep).trim();
      name = trimmed.slice(sep + 1).trim();
    } else {
      deviceUserId = trimmed;
      name = '';
    }

    if (!deviceUserId) continue;
    if (
      rows.length === 0 &&
      deviceUserId.toLowerCase() === 'deviceuserid' &&
      name.toLowerCase() === 'name'
    ) {
      continue;
    }
    if (
      rows.length === 0 &&
      (deviceUserId.toLowerCase() === 'id' ||
        deviceUserId.toLowerCase() === 'user_id') &&
      name.toLowerCase() === 'name'
    ) {
      continue;
    }

    rows.push({ deviceUserId, name });
  }

  return rows;
}
