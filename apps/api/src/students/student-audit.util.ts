import { Prisma } from '@generated/prisma/client';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StudentAuditLogEntryDto } from './dto/student-audit.dto';
import { UpdatePendingStudentDto } from './dto/pending-students.dto';
import { UpdateStudentDetailsDto } from './dto/student-details.dto';
import { UpdateStudentDto } from './dto/students.dto';

export type StudentAuditChange = {
  field: string;
  old: string | null;
  new: string | null;
};

/** Fields stored in audit `changes` — keys match web i18n (`students` / `students.detailsForm`). */
export const STUDENT_AUDIT_FIELD_KEYS = [
  'firstName',
  'secondName',
  'thirdName',
  'fourthName',
  'section',
  'homeAddress',
  'birthPlace',
  'birthDate',
  'nationalIdNumber',
  'residenceCardNumber',
  'foodRationCardNumber',
  'guardianName',
  'guardianMobile',
  'studentMobile',
  'stage',
  'comeViaWho',
  'guardianInfo',
] as const;

export type StudentAuditFieldKey = (typeof STUDENT_AUDIT_FIELD_KEYS)[number];

export type StudentAuditSource = {
  firstName: string;
  secondName: string;
  thirdName: string | null;
  fourthName: string | null;
  section: string | null;
  phoneNumbers: string[];
  guardianInfo: string | null;
  comeViaWho: string | null;
  homeAddress: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  nationalIdNumber: string | null;
  residenceCardNumber: string | null;
  foodRationCardNumber: string | null;
  guardianName: string | null;
  guardianMobile: string | null;
  stage: string | null;
};

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function formatBirthDateValue(date: Date | null | undefined): string | null {
  if (!date) {
    return null;
  }
  const time = date.getTime();
  if (Number.isNaN(time)) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function parseBirthDateFromDto(value: string): string | null {
  if (!value.trim()) {
    return null;
  }
  return formatBirthDateValue(new Date(value));
}

export function readStudentAuditValue(
  student: StudentAuditSource,
  field: StudentAuditFieldKey,
): string | null {
  switch (field) {
    case 'studentMobile':
      return emptyToNull(student.phoneNumbers[0] ?? null);
    case 'birthDate':
      return formatBirthDateValue(student.birthDate);
    case 'firstName':
    case 'secondName':
    case 'section':
      return emptyToNull(student[field]);
    case 'thirdName':
    case 'fourthName':
    case 'homeAddress':
    case 'birthPlace':
    case 'nationalIdNumber':
    case 'residenceCardNumber':
    case 'foodRationCardNumber':
    case 'guardianName':
    case 'guardianMobile':
    case 'stage':
    case 'comeViaWho':
    case 'guardianInfo':
      return emptyToNull(student[field]);
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
}

function pushChangeIfDifferent(
  changes: StudentAuditChange[],
  field: StudentAuditFieldKey,
  oldValue: string | null,
  newValue: string | null,
): void {
  if (oldValue === newValue) {
    return;
  }
  changes.push({ field, old: oldValue, new: newValue });
}

export function computeUpdateStudentDtoChanges(
  existing: StudentAuditSource,
  dto: UpdateStudentDto,
): StudentAuditChange[] {
  const changes: StudentAuditChange[] = [];

  if (dto.firstName !== undefined) {
    pushChangeIfDifferent(
      changes,
      'firstName',
      readStudentAuditValue(existing, 'firstName'),
      emptyToNull(dto.firstName),
    );
  }
  if (dto.secondName !== undefined) {
    pushChangeIfDifferent(
      changes,
      'secondName',
      readStudentAuditValue(existing, 'secondName'),
      emptyToNull(dto.secondName),
    );
  }
  if (dto.thirdName !== undefined) {
    pushChangeIfDifferent(
      changes,
      'thirdName',
      readStudentAuditValue(existing, 'thirdName'),
      emptyToNull(dto.thirdName),
    );
  }
  if (dto.fourthName !== undefined) {
    pushChangeIfDifferent(
      changes,
      'fourthName',
      readStudentAuditValue(existing, 'fourthName'),
      emptyToNull(dto.fourthName),
    );
  }
  if (dto.section !== undefined) {
    pushChangeIfDifferent(
      changes,
      'section',
      readStudentAuditValue(existing, 'section'),
      emptyToNull(dto.section),
    );
  }

  return changes;
}

export function computeUpdateStudentDetailsDtoChanges(
  existing: StudentAuditSource,
  dto: UpdateStudentDetailsDto,
): StudentAuditChange[] {
  const changes: StudentAuditChange[] = [];

  if (dto.homeAddress !== undefined) {
    pushChangeIfDifferent(
      changes,
      'homeAddress',
      readStudentAuditValue(existing, 'homeAddress'),
      emptyToNull(dto.homeAddress),
    );
  }
  if (dto.birthPlace !== undefined) {
    pushChangeIfDifferent(
      changes,
      'birthPlace',
      readStudentAuditValue(existing, 'birthPlace'),
      emptyToNull(dto.birthPlace),
    );
  }
  if (dto.birthDate !== undefined) {
    pushChangeIfDifferent(
      changes,
      'birthDate',
      readStudentAuditValue(existing, 'birthDate'),
      parseBirthDateFromDto(dto.birthDate),
    );
  }
  if (dto.nationalIdNumber !== undefined) {
    pushChangeIfDifferent(
      changes,
      'nationalIdNumber',
      readStudentAuditValue(existing, 'nationalIdNumber'),
      emptyToNull(dto.nationalIdNumber),
    );
  }
  if (dto.residenceCardNumber !== undefined) {
    pushChangeIfDifferent(
      changes,
      'residenceCardNumber',
      readStudentAuditValue(existing, 'residenceCardNumber'),
      emptyToNull(dto.residenceCardNumber),
    );
  }
  if (dto.foodRationCardNumber !== undefined) {
    pushChangeIfDifferent(
      changes,
      'foodRationCardNumber',
      readStudentAuditValue(existing, 'foodRationCardNumber'),
      emptyToNull(dto.foodRationCardNumber),
    );
  }
  if (dto.guardianName !== undefined) {
    pushChangeIfDifferent(
      changes,
      'guardianName',
      readStudentAuditValue(existing, 'guardianName'),
      emptyToNull(dto.guardianName),
    );
  }
  if (dto.guardianMobile !== undefined) {
    pushChangeIfDifferent(
      changes,
      'guardianMobile',
      readStudentAuditValue(existing, 'guardianMobile'),
      emptyToNull(dto.guardianMobile),
    );
  }
  if (dto.stage !== undefined) {
    pushChangeIfDifferent(
      changes,
      'stage',
      readStudentAuditValue(existing, 'stage'),
      emptyToNull(dto.stage),
    );
  }
  if (dto.studentMobile !== undefined) {
    pushChangeIfDifferent(
      changes,
      'studentMobile',
      readStudentAuditValue(existing, 'studentMobile'),
      emptyToNull(dto.studentMobile),
    );
  }
  if (dto.section !== undefined) {
    pushChangeIfDifferent(
      changes,
      'section',
      readStudentAuditValue(existing, 'section'),
      emptyToNull(dto.section),
    );
  }

  return changes;
}

export function computeUpdatePendingStudentDtoChanges(
  existing: StudentAuditSource,
  dto: UpdatePendingStudentDto,
): StudentAuditChange[] {
  const changes = computeUpdateStudentDtoChanges(existing, dto);

  if (dto.guardianInfo !== undefined) {
    pushChangeIfDifferent(
      changes,
      'guardianInfo',
      readStudentAuditValue(existing, 'guardianInfo'),
      emptyToNull(dto.guardianInfo),
    );
  }
  if (dto.comeViaWho !== undefined) {
    pushChangeIfDifferent(
      changes,
      'comeViaWho',
      readStudentAuditValue(existing, 'comeViaWho'),
      emptyToNull(dto.comeViaWho),
    );
  }
  if (dto.phoneNumbers !== undefined) {
    const nextStudentMobile = emptyToNull(dto.phoneNumbers[0] ?? null);
    const nextGuardianMobile = emptyToNull(dto.phoneNumbers[1] ?? null);
    pushChangeIfDifferent(
      changes,
      'studentMobile',
      readStudentAuditValue(existing, 'studentMobile'),
      nextStudentMobile,
    );
    pushChangeIfDifferent(
      changes,
      'guardianMobile',
      readStudentAuditValue(existing, 'guardianMobile'),
      nextGuardianMobile,
    );
  }

  return changes;
}

export function parseAuditChangesJson(value: unknown): StudentAuditChange[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const record = entry as Record<string, unknown>;
    if (typeof record.field !== 'string') {
      return [];
    }

    return [
      {
        field: record.field,
        old: normalizeAuditChangeValue(record.old),
        new: normalizeAuditChangeValue(record.new),
      },
    ];
  });
}

function normalizeAuditChangeValue(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== 'string') {
    return String(value);
  }
  return value;
}

export function toStudentAuditLogEntries(
  rows: Array<{
    id: string;
    action: string;
    changedByName: string;
    createdAt: Date;
    changes: unknown;
  }>,
): StudentAuditLogEntryDto[] {
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    changedByName: row.changedByName,
    createdAt: row.createdAt,
    changes: parseAuditChangesJson(row.changes),
  }));
}

export const STUDENT_AUDIT_CREATED_FIELD = 'created';

export function computeCreateAuditChanges(): StudentAuditChange[] {
  return [{ field: STUDENT_AUDIT_CREATED_FIELD, old: null, new: null }];
}

export type WriteStudentAuditLogInput = {
  schoolId: string;
  action: 'CREATE' | 'UPDATE';
  actor: JwtPayload;
  changes: StudentAuditChange[];
} & (
  | { studentId: string; pendingStudentId?: undefined }
  | { pendingStudentId: string; studentId?: undefined }
);

export async function writeStudentAuditLog(
  tx: Prisma.TransactionClient,
  input: WriteStudentAuditLogInput,
): Promise<void> {
  const hasStudent = input.studentId != null && input.studentId.length > 0;
  const hasPending =
    input.pendingStudentId != null && input.pendingStudentId.length > 0;

  if (hasStudent === hasPending) {
    throw new Error('StudentAuditLog requires exactly one of studentId or pendingStudentId');
  }

  const user = await tx.user.findUnique({
    where: { id: input.actor.sub },
    select: { firstName: true, lastName: true },
  });

  await tx.studentAuditLog.create({
    data: {
      studentId: input.studentId ?? null,
      pendingStudentId: input.pendingStudentId ?? null,
      schoolId: input.schoolId,
      action: input.action,
      changedById: input.actor.sub,
      changedByName: buildChangedByName(user, input.actor.email),
      changes: input.changes as Prisma.InputJsonValue,
    },
  });
}

export function toStudentAuditSource(row: {
  firstName: string;
  secondName: string;
  thirdName: string | null;
  fourthName: string | null;
  section: string | null;
  phoneNumbers: string[];
  guardianInfo: string | null;
  comeViaWho: string | null;
  homeAddress: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  nationalIdNumber: string | null;
  residenceCardNumber: string | null;
  foodRationCardNumber: string | null;
  guardianName: string | null;
  guardianMobile: string | null;
  stage: string | null;
}): StudentAuditSource {
  return {
    firstName: row.firstName,
    secondName: row.secondName,
    thirdName: row.thirdName,
    fourthName: row.fourthName,
    section: row.section,
    phoneNumbers: row.phoneNumbers,
    guardianInfo: row.guardianInfo,
    comeViaWho: row.comeViaWho,
    homeAddress: row.homeAddress,
    birthPlace: row.birthPlace,
    birthDate: row.birthDate,
    nationalIdNumber: row.nationalIdNumber,
    residenceCardNumber: row.residenceCardNumber,
    foodRationCardNumber: row.foodRationCardNumber,
    guardianName: row.guardianName,
    guardianMobile: row.guardianMobile,
    stage: row.stage,
  };
}

export function buildChangedByName(
  user: { firstName: string; lastName: string } | null | undefined,
  emailFallback?: string,
): string {
  const parts = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (parts.length > 0) {
    return parts.join(' ');
  }

  const email = emailFallback?.trim();
  return email && email.length > 0 ? email : 'Unknown';
}
