/**
 * Fails if mobile locale JSON uses next-intl-style `{{var}}` placeholders.
 * Mobile i18next uses single braces `{var}` (see src/i18n/config.ts).
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = join(__dirname, '..', 'src', 'i18n', 'locales');

function walkStrings(
  obj: unknown,
  keyPath: string,
  file: string,
  violations: { file: string; keyPath: string; snippet: string }[],
): void {
  if (typeof obj === 'string') {
    if (obj.includes('{{')) {
      const idx = obj.indexOf('{{');
      violations.push({
        file,
        keyPath: keyPath.slice(1) || '(root)',
        snippet: obj.slice(Math.max(0, idx - 10), idx + 30),
      });
    }
    return;
  }
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      walkStrings(v, `${keyPath}.${k}`, file, violations);
    }
  }
}

function main(): void {
  const files = readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json'));
  const violations: { file: string; keyPath: string; snippet: string }[] = [];

  for (const file of files) {
    const raw = readFileSync(join(LOCALES_DIR, file), 'utf8');
    const data = JSON.parse(raw) as unknown;
    walkStrings(data, '', file, violations);
  }

  if (violations.length > 0) {
    console.error(
      'Mobile locale strings must use {var} placeholders, not {{var}} (i18next config).\n',
    );
    for (const v of violations) {
      console.error(`  ${v.file} → ${v.keyPath}\n    …${v.snippet}…\n`);
    }
    process.exit(1);
  }

  console.log(`check:i18n OK (${files.length} locale files, no "{{" in values).`);
}

main();
