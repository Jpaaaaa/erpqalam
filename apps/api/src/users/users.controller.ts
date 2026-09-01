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
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PERMISSIONS } from '../common/permissions/permissions';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ListUsersQueryDto,
  PaginatedUsersResponseDto,
  UpdateUserDto,
  ApproveUserDto,
  UpdateUserPermissionsDto,
  UserPermissionsResponseDto,
  UserResponseDto,
} from './dto/users.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.create(dto, user);
  }

  @Get()
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'List users in school' })
  @ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
  findAll(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(user, query);
  }

  @Get(':id/permissions')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get user permissions (manager only)' })
  @ApiResponse({ status: 200, type: UserPermissionsResponseDto })
  getPermissions(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserPermissionsResponseDto> {
    return this.usersService.getPermissions(id, user);
  }

  @Patch(':id/permissions')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Update user permissions (manager only)' })
  @ApiResponse({ status: 200, type: UserPermissionsResponseDto })
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserPermissionsResponseDto> {
    return this.usersService.updatePermissions(id, dto, user);
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
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Approve pending employee' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.approve(id, dto, user);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  deactivate(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<UserResponseDto> {
    return this.usersService.deactivate(id, user);
  }
}
