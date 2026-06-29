import {
  Body,
  Controller,
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
import { StudentsService } from './students.service';
import {
  CreateStudentPendingDto,
  CreateStudentPendingFullDto,
  ListStudentsQueryDto,
  PaginatedStudentsResponseDto,
  StudentResponseDto,
} from './dto/students.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('pending')
  @ApiOperation({ summary: 'Student name intake (public, pending)' })
  @ApiResponse({ status: 201, type: StudentResponseDto })
  createPending(
    @Body() dto: CreateStudentPendingDto,
  ): Promise<StudentResponseDto> {
    return this.studentsService.createPending(dto);
  }

  @Post('pending/full')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Add pending student with full details (manager only)' })
  @ApiResponse({ status: 201, type: StudentResponseDto })
  createPendingFull(
    @Body() dto: CreateStudentPendingFullDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentResponseDto> {
    return this.studentsService.createPendingFull(dto, user);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'List students (manager only)' })
  @ApiResponse({ status: 200, type: PaginatedStudentsResponseDto })
  findAll(
    @Query() query: ListStudentsQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedStudentsResponseDto> {
    return this.studentsService.findAll(user, query);
  }

  @Patch(':id/register')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Move pending student to registered (manager only)' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  register(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentResponseDto> {
    return this.studentsService.register(id, user);
  }
}
