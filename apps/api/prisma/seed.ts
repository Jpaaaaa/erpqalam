import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, UserRole, UserStatus } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const ATTENDANCE_SETTING_DEFAULTS: Record<string, string> = {
  shift_start_time: '08:00',
  shift_end_time: '17:00',
  entry_zone_start: '07:45',
  entry_zone_end: '08:00',
  exit_zone_start: '16:45',
  exit_zone_end: '17:30',
  late_zone_start_time: '08:00',
  late_zone_end_time: '08:15',
  early_left_zone_start_time: '16:30',
  early_left_zone_end_time: '16:45',
  working_days: '[0,1,2,3,4,5]',
  annual_holidays_days: '7',
  temp_holidays_per_full_holiday: '3',
};

async function seedAttendanceSettings(
  schoolId: string,
  tx: Pick<PrismaClient, 'attendanceSettings'>,
) {
  await tx.attendanceSettings.createMany({
    data: Object.entries(ATTENDANCE_SETTING_DEFAULTS).map(([key, value]) => ({
      schoolId,
      key,
      value,
    })),
    skipDuplicates: true,
  });
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const schoolCode = 'QALAM001';
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  const school = await prisma.school.upsert({
    where: { code: schoolCode },
    update: {},
    create: {
      name: 'Qalam Demo School',
      code: schoolCode,
    },
  });

  await seedAttendanceSettings(school.id, prisma);

  if (!adminEmail || !adminPassword) {
    console.log(
      'Seed skipped admin — set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one',
    );
    console.log(`  School code: ${schoolCode}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      schoolId: school.id,
    },
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      schoolId: school.id,
    },
  });

  console.log('Seed complete');
  console.log(`  School code: ${schoolCode}`);
  console.log(`  Admin:       ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
