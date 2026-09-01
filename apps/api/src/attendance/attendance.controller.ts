import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { PERMISSIONS } from '../common/permissions/permissions';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AttendanceService } from './attendance.service';
import {
  AttendanceDeviceResponseDto,
  AttendanceHolidayResponseDto,
  AttendanceRecordResponseDto,
  AttendanceSettingsResponseDto,
  AttendanceUserResponseDto,
  CreateAttendanceHolidayDto,
  CreateAttendanceHolidayRangeDto,
  CreateAttendanceUserDto,
  BulkImportUsersDto,
  BulkImportUsersResponseDto,
  CreateEmployeeHolidayDto,
  CreateEmployeeHolidayRangeDto,
  CreateTimeLeaveUsageDto,
  DeleteAttendanceHolidaysDto,
  DeleteEmployeeHolidaysDto,
  EmployeeHolidayResponseDto,
  EmployeeReportPdfQueryDto,
  EmployeeReportQueryDto,
  EmployeeReportResponseDto,
  LeaveBalanceResponseDto,
  ListAttendanceRecordsQueryDto,
  ManualPunchDto,
  SetLeaveBalanceDto,
  SuccessResponseDto,
  TimeLeaveUsageResponseDto,
  UpdateAttendanceDeviceDto,
  UpdateAttendanceSettingsDto,
  UpdateAttendanceUserDto,
} from './dto/attendance.dto';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('records')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List attendance records (date range + user filter)' })
  @ApiResponse({ status: 200, type: [AttendanceRecordResponseDto] })
  listRecords(
    @Query() query: ListAttendanceRecordsQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceRecordResponseDto[]> {
    return this.attendanceService.listRecords(user, query);
  }

  @Post('records/manual')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Add a manual punch' })
  @ApiResponse({ status: 201, type: SuccessResponseDto })
  addManualPunch(
    @Body() dto: ManualPunchDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.addManualPunch(user, dto);
  }

  @Get('users')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List attendance device users' })
  @ApiResponse({ status: 200, type: [AttendanceUserResponseDto] })
  listUsers(
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceUserResponseDto[]> {
    return this.attendanceService.listUsers(user);
  }

  @Post('users')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Create attendance device user' })
  @ApiResponse({ status: 201, type: AttendanceUserResponseDto })
  createUser(
    @Body() dto: CreateAttendanceUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceUserResponseDto> {
    return this.attendanceService.createUser(user, dto);
  }

  @Post('users/bulk')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Bulk import or update device user names' })
  @ApiResponse({ status: 201, type: BulkImportUsersResponseDto })
  bulkUpsertUsers(
    @Body() dto: BulkImportUsersDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BulkImportUsersResponseDto> {
    return this.attendanceService.bulkUpsertUsers(user, dto);
  }

  @Patch('users/:deviceUserId')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Update user name and schedule overrides' })
  @ApiResponse({ status: 200, type: AttendanceUserResponseDto })
  updateUser(
    @Param('deviceUserId') deviceUserId: string,
    @Body() dto: UpdateAttendanceUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceUserResponseDto> {
    return this.attendanceService.updateUser(user, deviceUserId, dto);
  }

  @Delete('users/:deviceUserId')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Delete attendance device user' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  deleteUser(
    @Param('deviceUserId') deviceUserId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.deleteUser(user, deviceUserId);
  }

  @Get('devices')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List ZKTeco attendance devices' })
  @ApiResponse({ status: 200, type: [AttendanceDeviceResponseDto] })
  listDevices(
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceDeviceResponseDto[]> {
    return this.attendanceService.listDevices(user);
  }

  @Patch('devices/:serialNumber')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Update device display name' })
  @ApiResponse({ status: 200, type: AttendanceDeviceResponseDto })
  updateDevice(
    @Param('serialNumber') serialNumber: string,
    @Body() dto: UpdateAttendanceDeviceDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceDeviceResponseDto> {
    return this.attendanceService.updateDevice(user, serialNumber, dto);
  }

  @Get('settings')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'Get school attendance settings' })
  @ApiResponse({ status: 200, type: AttendanceSettingsResponseDto })
  getSettings(
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceSettingsResponseDto> {
    return this.attendanceService.getSettings(user);
  }

  @Patch('settings')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Update school attendance settings' })
  @ApiResponse({ status: 200, type: AttendanceSettingsResponseDto })
  updateSettings(
    @Body() dto: UpdateAttendanceSettingsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceSettingsResponseDto> {
    return this.attendanceService.updateSettings(user, dto);
  }

  @Get('holidays')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List org-wide attendance holidays' })
  @ApiResponse({ status: 200, type: [AttendanceHolidayResponseDto] })
  listHolidays(
    @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceHolidayResponseDto[]> {
    return this.attendanceService.listHolidays(user);
  }

  @Post('holidays')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Add org-wide holiday' })
  @ApiResponse({ status: 201, type: SuccessResponseDto })
  addHoliday(
    @Body() dto: CreateAttendanceHolidayDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.addHoliday(user, dto);
  }

  @Post('holidays/range')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Add org-wide holidays for date range' })
  @ApiResponse({ status: 201, type: SuccessResponseDto })
  addHolidayRange(
    @Body() dto: CreateAttendanceHolidayRangeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.addHolidayRange(user, dto);
  }

  @Delete('holidays/:id')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Remove org-wide holiday' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  removeHoliday(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.removeHoliday(user, id);
  }

  @Delete('holidays')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Remove multiple org-wide holidays' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  removeHolidays(
    @Body() dto: DeleteAttendanceHolidaysDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.removeHolidays(user, dto.ids);
  }

  @Get('employee-holidays')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List per-employee holidays' })
  @ApiResponse({ status: 200, type: [EmployeeHolidayResponseDto] })
  listEmployeeHolidays(
    @CurrentUser() user: JwtPayload,
  ): Promise<EmployeeHolidayResponseDto[]> {
    return this.attendanceService.listEmployeeHolidays(user);
  }

  @Post('employee-holidays')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Add employee holiday (deducts balance)' })
  @ApiResponse({ status: 201, type: SuccessResponseDto })
  addEmployeeHoliday(
    @Body() dto: CreateEmployeeHolidayDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.addEmployeeHoliday(user, dto);
  }

  @Post('employee-holidays/range')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Add employee holidays for date range' })
  @ApiResponse({ status: 201, type: SuccessResponseDto })
  addEmployeeHolidayRange(
    @Body() dto: CreateEmployeeHolidayRangeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.addEmployeeHolidayRange(user, dto);
  }

  @Delete('employee-holidays/:id')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Remove employee holiday (restores balance)' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  removeEmployeeHoliday(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.removeEmployeeHoliday(user, id);
  }

  @Delete('employee-holidays')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Remove multiple employee holidays' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  removeEmployeeHolidays(
    @Body() dto: DeleteEmployeeHolidaysDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.removeEmployeeHolidays(user, dto.ids);
  }

  @Get('time-leave-usage')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List time-leave coverage records' })
  @ApiResponse({ status: 200, type: [TimeLeaveUsageResponseDto] })
  listTimeLeaveUsage(
    @CurrentUser() user: JwtPayload,
  ): Promise<TimeLeaveUsageResponseDto[]> {
    return this.attendanceService.listTimeLeaveUsage(user);
  }

  @Post('time-leave-usage')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Cover late/early with time-leave (may deduct balance)' })
  @ApiResponse({ status: 201, type: SuccessResponseDto })
  addTimeLeaveUsage(
    @Body() dto: CreateTimeLeaveUsageDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.addTimeLeaveUsage(user, dto);
  }

  @Delete('time-leave-usage/:id')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Remove time-leave usage (may restore balance)' })
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  removeTimeLeaveUsage(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponseDto> {
    return this.attendanceService.removeTimeLeaveUsage(user, id);
  }

  @Get('leave-balances')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'List employee leave balances' })
  @ApiResponse({ status: 200, type: [LeaveBalanceResponseDto] })
  listLeaveBalances(
    @CurrentUser() user: JwtPayload,
  ): Promise<LeaveBalanceResponseDto[]> {
    return this.attendanceService.listLeaveBalances(user);
  }

  @Patch('leave-balances/:deviceUserId')
  @RequirePermission(PERMISSIONS.ATTENDANCE_MANAGE)
  @ApiOperation({ summary: 'Set employee leave balance' })
  @ApiResponse({ status: 200, type: LeaveBalanceResponseDto })
  setLeaveBalance(
    @Param('deviceUserId') deviceUserId: string,
    @Body() dto: SetLeaveBalanceDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<LeaveBalanceResponseDto> {
    return this.attendanceService.setLeaveBalance(user, deviceUserId, dto);
  }

  @Get('employee-report')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'Employee attendance report with late/early occurrences' })
  @ApiResponse({ status: 200, type: EmployeeReportResponseDto })
  getEmployeeReport(
    @Query() query: EmployeeReportQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmployeeReportResponseDto> {
    return this.attendanceService.getEmployeeReport(user, query);
  }

  @Get('employee-report/pdf')
  @RequirePermission(PERMISSIONS.ATTENDANCE_VIEW)
  @ApiOperation({ summary: 'Download employee attendance report as PDF' })
  async getEmployeeReportPdf(
    @Query() query: EmployeeReportPdfQueryDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } =
      await this.attendanceService.getEmployeeReportPdf(user, query);
    const filename = encodeURIComponent(fileName);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
    );
    res.status(200).send(buffer);
  }
}
