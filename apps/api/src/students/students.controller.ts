import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { UserPermission } from '@generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StudentsService, toStudentResponse } from './students.service';
import { PendingStudentsService } from './pending-students.service';
import {
  ListStudentsQueryDto,
  PaginatedStudentsResponseDto,
  StudentResponseDto,
  UpdateStudentDto,
} from './dto/students.dto';
import {
  CreatePendingStudentCheckInDto,
  CreatePendingStudentDto,
  ListPendingStudentsQueryDto,
  PaginatedPendingStudentsResponseDto,
  PendingStudentResponseDto,
  UpdatePendingStudentDto,
} from './dto/pending-students.dto';
import { UpdateStudentDetailsDto } from './dto/student-details.dto';

@ApiTags('students')
@Controller()
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly pendingStudentsService: PendingStudentsService,
  ) {}

  @Post('students/pending')
  @ApiOperation({ summary: 'Public student check-in (minimal pending intake)' })
  @ApiResponse({ status: 201, type: PendingStudentResponseDto })
  createCheckIn(
    @Body() dto: CreatePendingStudentCheckInDto,
  ): Promise<PendingStudentResponseDto> {
    return this.pendingStudentsService.createCheckIn(dto);
  }

  @Post('pending-students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Staff: register a pending student with full details' })
  @ApiResponse({ status: 201, type: PendingStudentResponseDto })
  createPending(
    @Body() dto: CreatePendingStudentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    return this.pendingStudentsService.create(dto, user);
  }

  @Get('pending-students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'List pending students for the school' })
  @ApiResponse({ status: 200, type: PaginatedPendingStudentsResponseDto })
  listPending(
    @Query() query: ListPendingStudentsQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedPendingStudentsResponseDto> {
    return this.pendingStudentsService.findAll(user, query);
  }

  @Patch('pending-students/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Update a pending student (e.g. complete check-in)' })
  @ApiResponse({ status: 200, type: PendingStudentResponseDto })
  updatePending(
    @Param('id') id: string,
    @Body() dto: UpdatePendingStudentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    return this.pendingStudentsService.update(id, dto, user);
  }

  @Patch('pending-students/:id/details')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Save optional registration details for a pending student' })
  @ApiResponse({ status: 200, type: PendingStudentResponseDto })
  updatePendingDetails(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDetailsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    return this.pendingStudentsService.updateDetails(id, dto, user);
  }

  @Patch('pending-students/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Approve pending student → enrolled Student record' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  async approvePending(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentResponseDto> {
    const student = await this.pendingStudentsService.approve(id, user);
    return toStudentResponse(student);
  }

  @Delete('pending-students/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pending student' })
  @ApiResponse({ status: 204, description: 'Pending student deleted' })
  async deletePending(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.pendingStudentsService.remove(id, user);
  }

  @Get('students')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'List registered (enrolled) students' })
  @ApiResponse({ status: 200, type: PaginatedStudentsResponseDto })
  findAll(
    @Query() query: ListStudentsQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedStudentsResponseDto> {
    return this.studentsService.findAll(user, query);
  }

  @Patch('students/:id/details')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Save optional registration details for an enrolled student' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  async updateStudentDetails(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDetailsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentResponseDto> {
    return this.studentsService.updateDetails(id, dto, user);
  }

  @Patch('students/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Update enrolled student fields (e.g. section)' })
  @ApiResponse({ status: 200, type: StudentResponseDto })
  async updateStudent(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentResponseDto> {
    return this.studentsService.update(id, dto, user);
  }

  @Delete('students/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a registered student' })
  @ApiResponse({ status: 204, description: 'Student deleted' })
  async deleteStudent(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.studentsService.remove(id, user);
  }
}
