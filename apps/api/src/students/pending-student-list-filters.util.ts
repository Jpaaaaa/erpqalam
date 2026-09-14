import type { Prisma } from '@generated/prisma/client';
import type { ListPendingStudentsQueryDto } from './dto/pending-students.dto';

function localDayStart(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function localDayEnd(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function buildPendingListWhere(
  schoolId: string,
  query: ListPendingStudentsQueryDto,
  phoneMatchIds: string[] = [],
): Prisma.PendingStudentWhereInput {
  const and: Prisma.PendingStudentWhereInput[] = [{ schoolId }];

  const q = query.search?.trim();
  if (q) {
    const or: Prisma.PendingStudentWhereInput[] = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { secondName: { contains: q, mode: 'insensitive' } },
      { thirdName: { contains: q, mode: 'insensitive' } },
      { fourthName: { contains: q, mode: 'insensitive' } },
      { guardianMobile: { contains: q, mode: 'insensitive' } },
      { nationalIdNumber: { contains: q, mode: 'insensitive' } },
    ];

    if (phoneMatchIds.length) {
      or.push({ id: { in: phoneMatchIds } });
    }

    and.push({ OR: or });
  }

  const section = query.section?.trim();
  if (section) {
    and.push({ section });
  }

  const createdAt: Prisma.DateTimeFilter = {};
  if (query.createdFrom) {
    createdAt.gte = localDayStart(query.createdFrom);
  }
  if (query.createdTo) {
    createdAt.lte = localDayEnd(query.createdTo);
  }
  if (createdAt.gte || createdAt.lte) {
    and.push({ createdAt });
  }

  if (query.hasGuardianMobile === 'true') {
    and.push({
      AND: [{ guardianMobile: { not: null } }, { guardianMobile: { not: '' } }],
    });
  } else if (query.hasGuardianMobile === 'false') {
    and.push({
      OR: [{ guardianMobile: null }, { guardianMobile: '' }],
    });
  }

  return and.length === 1 ? and[0]! : { AND: and };
}

export function phoneIlikePattern(search: string): string {
  return `%${search.trim()}%`;
}
