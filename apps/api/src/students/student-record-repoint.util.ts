import { Prisma } from '@generated/prisma/client';

export async function repointPendingStudentLinksOnApprove(
  tx: Prisma.TransactionClient,
  params: {
    pendingStudentId: string;
    studentId: string;
    schoolId: string;
  },
): Promise<void> {
  await tx.studentAuditLog.updateMany({
    where: {
      pendingStudentId: params.pendingStudentId,
      schoolId: params.schoolId,
    },
    data: {
      studentId: params.studentId,
      pendingStudentId: null,
    },
  });

  await tx.documentRequestLetter.updateMany({
    where: {
      pendingStudentId: params.pendingStudentId,
      schoolId: params.schoolId,
    },
    data: {
      studentId: params.studentId,
      pendingStudentId: null,
    },
  });
}
