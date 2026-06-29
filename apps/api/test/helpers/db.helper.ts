import { PrismaService } from '../../src/database/prisma.service';

export async function cleanupSchool(
  prisma: PrismaService,
  schoolId: string,
): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { user: { schoolId } },
  });
  await prisma.user.deleteMany({ where: { schoolId } });
  await prisma.school.delete({ where: { id: schoolId } });
}
