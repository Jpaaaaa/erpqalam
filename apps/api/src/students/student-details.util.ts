import { UpdateStudentDetailsDto } from './dto/student-details.dto';

export const studentDetailsSelect = {
  homeAddress: true,
  birthPlace: true,
  birthDate: true,
  nationalIdNumber: true,
  residenceCardNumber: true,
  foodRationCardNumber: true,
  guardianName: true,
  guardianMobile: true,
  stage: true,
  detailsCompletedAt: true,
} as const;

export function copyStudentDetailsFromPending(pending: {
  homeAddress: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  nationalIdNumber: string | null;
  residenceCardNumber: string | null;
  foodRationCardNumber: string | null;
  guardianName: string | null;
  guardianMobile: string | null;
  stage: string | null;
  detailsCompletedAt: Date | null;
}) {
  return {
    homeAddress: pending.homeAddress,
    birthPlace: pending.birthPlace,
    birthDate: pending.birthDate,
    nationalIdNumber: pending.nationalIdNumber,
    residenceCardNumber: pending.residenceCardNumber,
    foodRationCardNumber: pending.foodRationCardNumber,
    guardianName: pending.guardianName,
    guardianMobile: pending.guardianMobile,
    stage: pending.stage,
    detailsCompletedAt: pending.detailsCompletedAt,
  };
}

export function syncPhoneNumbersFromDetails(
  existingPhones: string[],
  dto: UpdateStudentDetailsDto,
): string[] | undefined {
  if (dto.studentMobile === undefined && dto.guardianMobile === undefined) {
    return undefined;
  }

  const phones = [...existingPhones];
  while (phones.length < 2) {
    phones.push('');
  }

  if (dto.studentMobile !== undefined) {
    phones[0] = dto.studentMobile.trim();
  }
  if (dto.guardianMobile !== undefined) {
    phones[1] = dto.guardianMobile.trim();
  }

  return phones.slice(0, 2);
}
