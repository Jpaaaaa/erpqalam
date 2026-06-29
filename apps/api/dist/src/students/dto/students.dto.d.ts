export declare class ListStudentsQueryDto {
    page?: number;
    limit?: number;
}
export declare class StudentRegistrarDto {
    id: string;
    firstName: string;
    lastName: string;
}
export declare class StudentResponseDto {
    id: string;
    firstName: string;
    secondName: string;
    thirdName?: string | null;
    fourthName?: string | null;
    section: string;
    phoneNumbers: string[];
    guardianInfo?: string | null;
    comeViaWho?: string | null;
    schoolId: string;
    registeredByUserId?: string | null;
    registeredBy?: StudentRegistrarDto | null;
    registeredAt?: Date | null;
    pendingStudentId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedStudentsResponseDto {
    data: StudentResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
