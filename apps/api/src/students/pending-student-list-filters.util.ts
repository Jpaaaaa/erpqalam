import type { Prisma } from '@generated/prisma/client';

export function buildPendingListWhere(
  schoolId: string,
  search?: string,
  phoneMatchIds: string[] = [],
): Prisma.PendingStudentWhereInput {
  const and: Prisma.PendingStudentWhereInput[] = [{ schoolId }];

  const q = search?.trim();
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

  return and.length === 1 ? and[0]! : { AND: and };
}

export function phoneIlikePattern(search: string): string {
  return `%${search.trim()}%`;
}
