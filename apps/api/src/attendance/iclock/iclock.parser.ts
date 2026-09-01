import { parseLocalTimestamp } from '../attendance-rules';

export type ParsedAttlogRow = {
  deviceUserId: string;
  timestamp: Date;
  verifyType: string;
};

/** Map ZKTeco verifyMode int to attendance verifyType strings. */
export function mapVerifyMode(verifyMode: number): string {
  if (verifyMode === 1) return 'finger';
  if (verifyMode === 0 || verifyMode === 2) return 'pin';
  if (verifyMode === 15) return 'face';
  if (verifyMode === 4) return 'card';
  return 'finger';
}

/**
 * Parse ATTLOG body: tab-separated rows
 * userId \t YYYY-MM-DD HH:MM:SS \t status \t verifyMode \t workcode \t reserved
 */
export function parseAttlogBody(body: string): ParsedAttlogRow[] {
  const rows: ParsedAttlogRow[] = [];

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split('\t');
    if (parts.length < 2) continue;

    const deviceUserId = parts[0]?.trim();
    const timestampStr = parts[1]?.trim();
    if (!deviceUserId || !timestampStr) continue;

    const timestamp = parseLocalTimestamp(timestampStr);
    if (!timestamp) continue;

    const verifyModeRaw = parts[3]?.trim() ?? '1';
    const verifyMode = parseInt(verifyModeRaw, 10);

    rows.push({
      deviceUserId,
      timestamp,
      verifyType: mapVerifyMode(Number.isNaN(verifyMode) ? 1 : verifyMode),
    });
  }

  return rows;
}

export function buildHandshakeConfig(serialNumber: string): string {
  return [
    `GET OPTION FROM: ${serialNumber}`,
    'Stamp=9999',
    'OpStamp=9999',
    'ErrorDelay=30',
    'Delay=10',
    'TransTimes=00:00;14:05',
    'TransInterval=1',
    'TransFlag=1111000000',
    'Realtime=1',
    'TimeZone=3',
    'Encrypt=0',
  ].join('\r\n');
}

export type ParsedDeviceUser = {
  deviceUserId: string;
  name: string;
};

/** Parse Key=Value tokens separated by tabs or spaces. */
export function parseKeyValueFields(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  if (text.includes('\t')) {
    for (const part of text.split('\t')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      result[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
    return result;
  }

  const regex = /([A-Za-z_][A-Za-z0-9_]*)=([\s\S]*?)(?=\s+[A-Za-z_][A-Za-z0-9_]*=|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    result[match[1]] = match[2].trim();
  }

  return result;
}

/**
 * Parse ZKTeco USER lines from OPERLOG / USER / USERINFO payloads.
 * Example: USER PIN=982 Name=Richard Passwd=9822 Card=13375590 Grp=1 TZ=
 */
export function parseUserLine(line: string): ParsedDeviceUser | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('USER')) return null;

  const rest = trimmed.slice(4).trim();
  if (!rest) return null;

  const fields = parseKeyValueFields(rest);
  const deviceUserId = (fields.PIN ?? '').trim();
  if (!deviceUserId) return null;

  return {
    deviceUserId,
    name: (fields.Name ?? '').trim(),
  };
}

/** Extract all USER records from a multi-line iclock body. */
export function parseDeviceUserBody(body: string): ParsedDeviceUser[] {
  const users: ParsedDeviceUser[] = [];
  const seen = new Set<string>();

  for (const line of body.split(/\r?\n/)) {
    const parsed = parseUserLine(line);
    if (!parsed || seen.has(parsed.deviceUserId)) continue;
    seen.add(parsed.deviceUserId);
    users.push(parsed);
  }

  return users;
}

/** Skip device placeholder names (Name equals PIN) when a real name exists. */
export function shouldApplyDeviceUserName(
  deviceUserId: string,
  incomingName: string,
  existingName?: string | null,
): boolean {
  const name = incomingName.trim();
  if (!name) return false;

  const existing = (existingName ?? '').trim();
  if (name === deviceUserId && existing && existing !== deviceUserId) {
    return false;
  }

  return true;
}
