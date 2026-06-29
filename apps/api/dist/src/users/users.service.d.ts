import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateUserDto, ListUsersQueryDto, PaginatedUsersResponseDto, ApproveUserDto, UpdateUserDto, UserResponseDto } from './dto/users.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto, actor: JwtPayload): Promise<UserResponseDto>;
    findAll(actor: JwtPayload, query: ListUsersQueryDto): Promise<PaginatedUsersResponseDto>;
    findOne(id: string, actor: JwtPayload): Promise<UserResponseDto>;
    update(id: string, dto: UpdateUserDto, actor: JwtPayload): Promise<UserResponseDto>;
    approve(id: string, dto: ApproveUserDto, actor: JwtPayload): Promise<UserResponseDto>;
    deactivate(id: string, actor: JwtPayload): Promise<UserResponseDto>;
}
