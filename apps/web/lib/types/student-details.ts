export interface StudentDetailsFields {
  homeAddress?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  nationalIdNumber?: string | null;
  residenceCardNumber?: string | null;
  foodRationCardNumber?: string | null;
  guardianName?: string | null;
  guardianMobile?: string | null;
  stage?: string | null;
  detailsCompletedAt?: string | null;
}

export interface UpdateStudentDetailsPayload {
  homeAddress?: string;
  birthPlace?: string;
  birthDate?: string;
  nationalIdNumber?: string;
  residenceCardNumber?: string;
  foodRationCardNumber?: string;
  guardianName?: string;
  guardianMobile?: string;
  studentMobile?: string;
  stage?: string;
}
