import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ListStudentsQueryDto, PaginatedStudentsResponseDto, StudentResponseDto } from './dto/students.dto';
declare const registeredBySelect: {
    readonly id: true;
    readonly firstName: true;
    readonly lastName: true;
};
declare const studentInclude: {
    readonly registeredBy: {
        readonly select: {
            readonly id: true;
            readonly firstName: true;
            readonly lastName: true;
        };
    };
};
declare function toStudentResponse(student: {
    id: string;
    firstName: string;
    secondName: string;
    thirdName: string | null;
    fourthName: string | null;
    section: string;
    phoneNumbers: string[];
    guardianInfo: string | null;
    comeViaWho: string | null;
    schoolId: string;
    registeredByUserId: string | null;
    registeredAt: Date | null;
    pendingStudentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    registeredBy?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
}): StudentResponseDto;
export declare class StudentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(actor: JwtPayload, query: ListStudentsQueryDto): Promise<PaginatedStudentsResponseDto>;
}
export { toStudentResponse, studentInclude, registeredBySelect };
