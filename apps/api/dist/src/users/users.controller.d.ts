import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';
import { CreateUserDto, ListUsersQueryDto, PaginatedUsersResponseDto, UpdateUserDto, ApproveUserDto, UserResponseDto } from './dto/users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto, user: JwtPayload): Promise<UserResponseDto>;
    findAll(query: ListUsersQueryDto, user: JwtPayload): Promise<PaginatedUsersResponseDto>;
    findOne(id: string, user: JwtPayload): Promise<UserResponseDto>;
    update(id: string, dto: UpdateUserDto, user: JwtPayload): Promise<UserResponseDto>;
    approve(id: string, dto: ApproveUserDto, user: JwtPayload): Promise<UserResponseDto>;
    deactivate(id: string, user: JwtPayload): Promise<UserResponseDto>;
}
