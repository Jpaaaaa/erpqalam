import type { Prisma } from '@generated/prisma/client';
import type { ListStudentsQueryDto } from './dto/students.dto';

export function buildStudentListWhere(
  schoolId: string,
  query: ListStudentsQueryDto,
): Prisma.StudentWhereInput {
  const and: Prisma.StudentWhereInput[] = [{ schoolId }];

  const q = query.q?.trim();
  if (q) {
    and.push({
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { secondName: { contains: q, mode: 'insensitive' } },
        { thirdName: { contains: q, mode: 'insensitive' } },
        { fourthName: { contains: q, mode: 'insensitive' } },
        { guardianName: { contains: q, mode: 'insensitive' } },
        { guardianInfo: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  const section = query.section?.trim();
  if (section) {
    and.push({ section });
  }

  if (query.detailsStatus === 'complete') {
    and.push({ detailsCompletedAt: { not: null } });
  } else if (query.detailsStatus === 'incomplete') {
    and.push({ detailsCompletedAt: null });
  }

  const cameVia = query.cameVia?.trim();
  if (cameVia) {
    and.push(
      cameVia === 'friends'
        ? { comeViaWho: { startsWith: 'friends' } }
        : { comeViaWho: cameVia },
    );
  }

  const phone = query.phone?.trim();
  if (phone) {
    and.push({
      OR: [
        { guardianMobile: { contains: phone, mode: 'insensitive' } },
        { phoneNumbers: { has: phone } },
      ],
    });
  }

  const stage = query.stage?.trim();
  if (stage) {
    and.push({ stage: { contains: stage, mode: 'insensitive' } });
  }

  return and.length === 1 ? and[0]! : { AND: and };
}
