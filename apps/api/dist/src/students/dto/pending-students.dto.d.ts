export declare class CreatePendingStudentCheckInDto {
    firstName: string;
    secondName: string;
    schoolCode: string;
    comeViaWho?: string;
}
export declare class CreatePendingStudentDto {
    firstName: string;
    secondName: string;
    thirdName: string;
    fourthName: string;
    section: string;
    phoneNumbers: string[];
    guardianInfo?: string;
    comeViaWho: string;
}
export declare class UpdatePendingStudentDto {
    firstName?: string;
    secondName?: string;
    thirdName?: string;
    fourthName?: string;
    section?: string;
    phoneNumbers?: string[];
    guardianInfo?: string;
    comeViaWho?: string;
}
export declare class ListPendingStudentsQueryDto {
    page?: number;
    limit?: number;
}
export declare class StaffMemberDto {
    id: string;
    firstName: string;
    lastName: string;
}
export declare class PendingStudentResponseDto {
    id: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section?: string | null;
    phoneNumbers: string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    submittedByUserId?: string | null;
    submittedBy?: StaffMemberDto | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedPendingStudentsResponseDto {
    data: PendingStudentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
