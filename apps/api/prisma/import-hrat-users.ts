/**
 * One-time import of HRAT user names into AttendanceUser.
 *
 * Option A — SQLite file (requires `sqlite3` CLI on PATH):
 *   HRAT_DB_PATH=/path/to/attendance.db npm run import:hrat-users
 *
 * Option B — CSV export (user_id,name header optional):
 *   HRAT_USERS_CSV=/path/to/users.csv npm run import:hrat-users
 *
 * Optional:
 *   SCHOOL_CODE=QALAM001  — target school (defaults to first school)
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../generated/prisma/client';

type HratUserRow = { user_id: string; name: string };

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }
    current += ch;
  }

  fields.push(current);
  return fields;
}

function loadFromCsv(csvPath: string): HratUserRow[] {
  const text = readFileSync(csvPath, 'utf8');
  const rows: HratUserRow[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [userId, name = ''] = parseCsvLine(trimmed);
    if (!userId || userId === 'user_id') continue;
    rows.push({ user_id: userId.trim(), name: name.trim() });
  }

  return rows;
}

function loadFromSqlite(dbPath: string): HratUserRow[] {
  try {
    const out = execFileSync(
      'sqlite3',
      [dbPath, '-csv', 'SELECT user_id, name FROM users ORDER BY user_id'],
      { encoding: 'utf8' },
    );
    return loadFromCsvString(out);
  } catch {
    throw new Error(
      'Could not read HRAT DB. Install the sqlite3 CLI, or export users to CSV and set HRAT_USERS_CSV.',
    );
  }
}

function loadFromCsvString(text: string): HratUserRow[] {
  const rows: HratUserRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [userId, name = ''] = parseCsvLine(trimmed);
    if (!userId || userId === 'user_id') continue;
    rows.push({ user_id: userId.trim(), name: name.trim() });
  }
  return rows;
}

async function main() {
  const csvPath = process.env.HRAT_USERS_CSV?.trim();
  const dbPath = process.env.HRAT_DB_PATH?.trim();

  let rows: HratUserRow[];
  if (csvPath) {
    rows = loadFromCsv(csvPath);
  } else if (dbPath) {
    rows = loadFromSqlite(dbPath);
  } else {
    console.error('Set HRAT_DB_PATH or HRAT_USERS_CSV.');
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('No users found to import.');
    return;
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const schoolCode = process.env.SCHOOL_CODE?.trim();
    const school = schoolCode
      ? await prisma.school.findUnique({ where: { code: schoolCode } })
      : await prisma.school.findFirst({ orderBy: { createdAt: 'asc' } });

    if (!school) {
      console.error(
        'No school found. Set SCHOOL_CODE or seed the database first.',
      );
      process.exit(1);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const deviceUserId = String(row.user_id ?? '').trim();
      const name = String(row.name ?? '').trim();
      if (!deviceUserId) {
        skipped++;
        continue;
      }

      const existing = await prisma.attendanceUser.findUnique({
        where: {
          schoolId_deviceUserId: { schoolId: school.id, deviceUserId },
        },
      });

      if (!existing) {
        await prisma.attendanceUser.create({
          data: {
            schoolId: school.id,
            deviceUserId,
            name: name || deviceUserId,
          },
        });
        created++;
      } else if (name && name !== existing.name.trim()) {
        await prisma.attendanceUser.update({
          where: {
            schoolId_deviceUserId: { schoolId: school.id, deviceUserId },
          },
          data: { name },
        });
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(
      `Imported into school "${school.code}": ${created} created, ${updated} updated, ${skipped} skipped (${rows.length} source rows).`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
