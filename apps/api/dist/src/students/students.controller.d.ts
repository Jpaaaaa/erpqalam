import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StudentsService } from './students.service';
import { PendingStudentsService } from './pending-students.service';
import { ListStudentsQueryDto, PaginatedStudentsResponseDto, StudentResponseDto } from './dto/students.dto';
import { CreatePendingStudentCheckInDto, CreatePendingStudentDto, ListPendingStudentsQueryDto, PaginatedPendingStudentsResponseDto, PendingStudentResponseDto, UpdatePendingStudentDto } from './dto/pending-students.dto';
export declare class StudentsController {
    private readonly studentsService;
    private readonly pendingStudentsService;
    constructor(studentsService: StudentsService, pendingStudentsService: PendingStudentsService);
    createCheckIn(dto: CreatePendingStudentCheckInDto): Promise<PendingStudentResponseDto>;
    createPending(dto: CreatePendingStudentDto, user: JwtPayload): Promise<PendingStudentResponseDto>;
    listPending(query: ListPendingStudentsQueryDto, user: JwtPayload): Promise<PaginatedPendingStudentsResponseDto>;
    updatePending(id: string, dto: UpdatePendingStudentDto, user: JwtPayload): Promise<PendingStudentResponseDto>;
    approvePending(id: string, user: JwtPayload): Promise<StudentResponseDto>;
    findAll(query: ListStudentsQueryDto, user: JwtPayload): Promise<PaginatedStudentsResponseDto>;
}
