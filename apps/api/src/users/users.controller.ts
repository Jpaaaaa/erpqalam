import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ListUsersQueryDto,
  PaginatedUsersResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/users.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a user (manager only)' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.create(dto, user);
  }

  @Get()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'List users in school (manager only)' })
  @ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
  findAll(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (manager or self)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (manager or self with limits)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto, user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Approve pending employee (manager only)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.approve(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Deactivate user (manager only)' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  deactivate(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.deactivate(id, user);
  }
}
