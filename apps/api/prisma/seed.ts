import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, UserRole, UserStatus } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const schoolCode = 'QALAM001';
  const managerEmail = 'manager@qalam.dev';

  const existing = await prisma.user.findUnique({
    where: { email: managerEmail },
  });

  if (existing) {
    console.log('Seed skipped — manager already exists');
    return;
  }

  const passwordHash = await bcrypt.hash('Manager123!', 12);

  await prisma.$transaction(async (tx) => {
    const school = await tx.school.upsert({
      where: { code: schoolCode },
      update: {},
      create: {
        name: 'Qalam Demo School',
        code: schoolCode,
      },
    });

    await tx.user.create({
      data: {
        email: managerEmail,
        passwordHash,
        firstName: 'Demo',
        lastName: 'Manager',
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        schoolId: school.id,
      },
    });
  });

  console.log('Seed complete');
  console.log(`  School code: ${schoolCode}`);
  console.log(`  Manager:     ${managerEmail} / Manager123!`);
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
