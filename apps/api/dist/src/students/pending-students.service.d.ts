import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreatePendingStudentCheckInDto, CreatePendingStudentDto, ListPendingStudentsQueryDto, PaginatedPendingStudentsResponseDto, PendingStudentResponseDto, UpdatePendingStudentDto } from './dto/pending-students.dto';
export declare class PendingStudentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createCheckIn(dto: CreatePendingStudentCheckInDto): Promise<PendingStudentResponseDto>;
    create(dto: CreatePendingStudentDto, actor: JwtPayload): Promise<PendingStudentResponseDto>;
    findAll(actor: JwtPayload, query: ListPendingStudentsQueryDto): Promise<PaginatedPendingStudentsResponseDto>;
    update(id: string, dto: UpdatePendingStudentDto, actor: JwtPayload): Promise<PendingStudentResponseDto>;
    private assertReadyForApproval;
    approve(id: string, actor: JwtPayload): Promise<{
        registeredBy: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        registeredAt: Date;
        pendingStudentId: string | null;
    }>;
}
