import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceHolidayType,
  Prisma,
  TimeLeaveUsageType,
} from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  AttendanceSettingsMap,
  AttendanceUserScheduleInput,
  buildEmployeeReport,
  classifyPunch,
  dateRangeBounds,
  DEFAULT_ATTENDANCE_SETTINGS,
  findEarlyExitOccurrences,
  findLateOccurrences,
  formatDateLocal,
  formatLocalTimestamp,
  parseDateLocal,
  parseLocalDateToDbDate,
  parseLocalTimestamp,
} from './attendance-rules';
import {
  AttendanceHolidayResponseDto,
  AttendanceRecordResponseDto,
  AttendanceSettingsResponseDto,
  AttendanceUserResponseDto,
  CreateAttendanceHolidayDto,
  CreateAttendanceHolidayRangeDto,
  CreateAttendanceUserDto,
  CreateEmployeeHolidayDto,
  CreateEmployeeHolidayRangeDto,
  CreateTimeLeaveUsageDto,
  EmployeeHolidayResponseDto,
  EmployeeReportQueryDto,
  EmployeeReportResponseDto,
  LeaveBalanceResponseDto,
  ListAttendanceRecordsQueryDto,
  ManualPunchDto,
  SetLeaveBalanceDto,
  SuccessResponseDto,
  TimeLeaveUsageResponseDto,
  UpdateAttendanceSettingsDto,
  UpdateAttendanceUserDto,
} from './dto/attendance.dto';

const HOLIDAY_TYPE_MAP: Record<string, AttendanceHolidayType> = {
  early_exit: AttendanceHolidayType.EARLY_EXIT,
  entry_late: AttendanceHolidayType.ENTRY_LATE,
  day_off: AttendanceHolidayType.DAY_OFF,
};

const HOLIDAY_TYPE_REVERSE: Record<AttendanceHolidayType, string> = {
  [AttendanceHolidayType.EARLY_EXIT]: 'early_exit',
  [AttendanceHolidayType.ENTRY_LATE]: 'entry_late',
  [AttendanceHolidayType.DAY_OFF]: 'day_off',
};

const TIME_LEAVE_TYPE_MAP: Record<string, TimeLeaveUsageType> = {
  late_arrival: TimeLeaveUsageType.LATE_ARRIVAL,
  early_exit: TimeLeaveUsageType.EARLY_EXIT,
};

const TIME_LEAVE_TYPE_REVERSE: Record<TimeLeaveUsageType, string> = {
  [TimeLeaveUsageType.LATE_ARRIVAL]: 'late_arrival',
  [TimeLeaveUsageType.EARLY_EXIT]: 'early_exit',
};

const SETTINGS_DTO_TO_DB: Record<string, string> = {
  shiftStartTime: 'shift_start_time',
  shiftEndTime: 'shift_end_time',
  entryZoneStart: 'entry_zone_start',
  entryZoneEnd: 'entry_zone_end',
  exitZoneStart: 'exit_zone_start',
  exitZoneEnd: 'exit_zone_end',
  lateZoneStartTime: 'late_zone_start_time',
  lateZoneEndTime: 'late_zone_end_time',
  earlyLeftZoneStartTime: 'early_left_zone_start_time',
  earlyLeftZoneEndTime: 'early_left_zone_end_time',
  workingDays: 'working_days',
  annualHolidaysDays: 'annual_holidays_days',
  tempHolidaysPerFullHoliday: 'temp_holidays_per_full_holiday',
};

function toUserScheduleInput(row: {
  deviceUserId: string;
  workingDays: string | null;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  entryZoneStart: string | null;
  entryZoneEnd: string | null;
  exitZoneStart: string | null;
  exitZoneEnd: string | null;
  lateZoneStartTime: string | null;
  lateZoneEndTime: string | null;
  earlyLeftZoneStartTime: string | null;
  earlyLeftZoneEndTime: string | null;
}): AttendanceUserScheduleInput {
  return { ...row };
}

function toUserResponse(row: {
  id: string;
  deviceUserId: string;
  name: string;
  workingDays: string | null;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  entryZoneStart: string | null;
  entryZoneEnd: string | null;
  exitZoneStart: string | null;
  exitZoneEnd: string | null;
  lateZoneStartTime: string | null;
  lateZoneEndTime: string | null;
  earlyLeftZoneStartTime: string | null;
  earlyLeftZoneEndTime: string | null;
  linkedUserId: string | null;
}): AttendanceUserResponseDto {
  return { ...row };
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private schoolId(user: JwtPayload): string {
    return user.schoolId;
  }

  async loadSettingsMap(schoolId: string): Promise<AttendanceSettingsMap> {
    const rows = await this.prisma.attendanceSettings.findMany({
      where: { schoolId },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    let workingDays: number[] = DEFAULT_ATTENDANCE_SETTINGS.working_days;
    const wdRaw = map.get('working_days');
    if (wdRaw) {
      try {
        const parsed = JSON.parse(wdRaw);
        if (Array.isArray(parsed)) workingDays = parsed;
      } catch {
        /* use default */
      }
    }
    return {
      shift_start_time:
        map.get('shift_start_time') ??
        DEFAULT_ATTENDANCE_SETTINGS.shift_start_time,
      shift_end_time:
        map.get('shift_end_time') ??
        DEFAULT_ATTENDANCE_SETTINGS.shift_end_time,
      entry_zone_start:
        map.get('entry_zone_start') ??
        DEFAULT_ATTENDANCE_SETTINGS.entry_zone_start,
      entry_zone_end:
        map.get('entry_zone_end') ??
        DEFAULT_ATTENDANCE_SETTINGS.entry_zone_end,
      exit_zone_start:
        map.get('exit_zone_start') ??
        DEFAULT_ATTENDANCE_SETTINGS.exit_zone_start,
      exit_zone_end:
        map.get('exit_zone_end') ?? DEFAULT_ATTENDANCE_SETTINGS.exit_zone_end,
      late_zone_start_time:
        map.get('late_zone_start_time') ??
        DEFAULT_ATTENDANCE_SETTINGS.late_zone_start_time,
      late_zone_end_time:
        map.get('late_zone_end_time') ??
        DEFAULT_ATTENDANCE_SETTINGS.late_zone_end_time,
      early_left_zone_start_time:
        map.get('early_left_zone_start_time') ??
        DEFAULT_ATTENDANCE_SETTINGS.early_left_zone_start_time,
      early_left_zone_end_time:
        map.get('early_left_zone_end_time') ??
        DEFAULT_ATTENDANCE_SETTINGS.early_left_zone_end_time,
      working_days: workingDays,
      annual_holidays_days: parseInt(
        map.get('annual_holidays_days') ??
          String(DEFAULT_ATTENDANCE_SETTINGS.annual_holidays_days),
        10,
      ),
      temp_holidays_per_full_holiday: parseInt(
        map.get('temp_holidays_per_full_holiday') ??
          String(DEFAULT_ATTENDANCE_SETTINGS.temp_holidays_per_full_holiday),
        10,
      ),
    };
  }

  private toSettingsResponse(
    settings: AttendanceSettingsMap,
  ): AttendanceSettingsResponseDto {
    return {
      shiftStartTime: settings.shift_start_time,
      shiftEndTime: settings.shift_end_time,
      entryZoneStart: settings.entry_zone_start,
      entryZoneEnd: settings.entry_zone_end,
      exitZoneStart: settings.exit_zone_start,
      exitZoneEnd: settings.exit_zone_end,
      lateZoneStartTime: settings.late_zone_start_time,
      lateZoneEndTime: settings.late_zone_end_time,
      earlyLeftZoneStartTime: settings.early_left_zone_start_time,
      earlyLeftZoneEndTime: settings.early_left_zone_end_time,
      workingDays: settings.working_days,
      annualHolidaysDays: settings.annual_holidays_days,
      tempHolidaysPerFullHoliday: settings.temp_holidays_per_full_holiday,
    };
  }

  async getSettings(user: JwtPayload): Promise<AttendanceSettingsResponseDto> {
    const settings = await this.loadSettingsMap(this.schoolId(user));
    return this.toSettingsResponse(settings);
  }

  async updateSettings(
    user: JwtPayload,
    dto: UpdateAttendanceSettingsDto,
  ): Promise<AttendanceSettingsResponseDto> {
    const schoolId = this.schoolId(user);
    const entries: { key: string; value: string }[] = [];

    for (const [dtoKey, dbKey] of Object.entries(SETTINGS_DTO_TO_DB)) {
      const val = (dto as Record<string, unknown>)[dtoKey];
      if (val === undefined) continue;
      if (dtoKey === 'workingDays' && Array.isArray(val)) {
        entries.push({ key: dbKey, value: JSON.stringify(val) });
      } else {
        entries.push({ key: dbKey, value: String(val) });
      }
    }

    if (entries.length > 0) {
      await this.prisma.$transaction(
        entries.map((e) =>
          this.prisma.attendanceSettings.upsert({
            where: {
              schoolId_key: { schoolId, key: e.key },
            },
            create: { schoolId, key: e.key, value: e.value },
            update: { value: e.value },
          }),
        ),
      );
    }

    return this.getSettings(user);
  }

  async listRecords(
    user: JwtPayload,
    query: ListAttendanceRecordsQueryDto,
  ): Promise<AttendanceRecordResponseDto[]> {
    const schoolId = this.schoolId(user);
    const { from, to } = dateRangeBounds(query.fromDate, query.toDate);
    const limit = query.limit ?? 500;

    const where: Prisma.AttendanceRecordWhereInput = { schoolId };
    if (query.deviceUserId) where.deviceUserId = query.deviceUserId;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    const [rows, settings, users, holidays] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
      }),
      this.loadSettingsMap(schoolId),
      this.prisma.attendanceUser.findMany({ where: { schoolId } }),
      this.prisma.attendanceHoliday.findMany({ where: { schoolId } }),
    ]);

    const usersMap = new Map(
      users.map((u) => [u.deviceUserId, toUserScheduleInput(u)]),
    );
    const earlyExitDates = new Set(
      holidays
        .filter((h) => h.type === AttendanceHolidayType.EARLY_EXIT)
        .map((h) => formatDateLocal(h.date)),
    );
    const lateEntryDates = new Set(
      holidays
        .filter((h) => h.type === AttendanceHolidayType.ENTRY_LATE)
        .map((h) => formatDateLocal(h.date)),
    );

    return rows.map((row) => {
      const punchType = classifyPunch(
        {
          deviceUserId: row.deviceUserId,
          timestamp: row.timestamp,
          verifyType: row.verifyType,
        },
        { settings, usersById: usersMap, earlyExitDates, lateEntryDates },
      );
      return {
        id: row.id,
        deviceUserId: row.deviceUserId,
        timestamp: formatLocalTimestamp(row.timestamp),
        verifyType: row.verifyType,
        deviceSerial: row.deviceSerial,
        createdAt: formatLocalTimestamp(row.createdAt),
        punchType,
      };
    });
  }

  async addManualPunch(
    user: JwtPayload,
    dto: ManualPunchDto,
  ): Promise<SuccessResponseDto> {
    const deviceUserId = dto.deviceUserId.trim();
    const ts = parseLocalTimestamp(dto.timestamp);
    if (!deviceUserId) {
      throw new BadRequestException('Device user ID is required');
    }
    if (!ts) {
      throw new BadRequestException('Invalid timestamp');
    }

    const kind = (dto.punchKind ?? 'in').toLowerCase();
    const verifyType = kind === 'out' ? 'manual_out' : 'manual_in';
    const schoolId = this.schoolId(user);

    try {
      await this.prisma.attendanceRecord.create({
        data: {
          schoolId,
          deviceUserId,
          timestamp: ts,
          verifyType,
          deviceSerial: 'manual',
        },
      });
      return { success: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          'Punch already exists for this user and time',
        );
      }
      throw err;
    }
  }

  async listUsers(user: JwtPayload): Promise<AttendanceUserResponseDto[]> {
    const rows = await this.prisma.attendanceUser.findMany({
      where: { schoolId: this.schoolId(user) },
      orderBy: { deviceUserId: 'asc' },
    });
    return rows.map(toUserResponse);
  }

  async createUser(
    user: JwtPayload,
    dto: CreateAttendanceUserDto,
  ): Promise<AttendanceUserResponseDto> {
    const deviceUserId = dto.deviceUserId.trim();
    if (!deviceUserId) {
      throw new BadRequestException('Device user ID is required');
    }
    const row = await this.prisma.attendanceUser.create({
      data: {
        schoolId: this.schoolId(user),
        deviceUserId,
        name: dto.name?.trim() ?? '',
      },
    });
    return toUserResponse(row);
  }

  async updateUser(
    user: JwtPayload,
    deviceUserId: string,
    dto: UpdateAttendanceUserDto,
  ): Promise<AttendanceUserResponseDto> {
    const schoolId = this.schoolId(user);
    const existing = await this.prisma.attendanceUser.findUnique({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
    });
    if (!existing) {
      throw new NotFoundException('Attendance user not found');
    }

    const data: Prisma.AttendanceUserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.workingDays !== undefined) data.workingDays = dto.workingDays;
    if (dto.shiftStartTime !== undefined) data.shiftStartTime = dto.shiftStartTime;
    if (dto.shiftEndTime !== undefined) data.shiftEndTime = dto.shiftEndTime;
    if (dto.entryZoneStart !== undefined) data.entryZoneStart = dto.entryZoneStart;
    if (dto.entryZoneEnd !== undefined) data.entryZoneEnd = dto.entryZoneEnd;
    if (dto.exitZoneStart !== undefined) data.exitZoneStart = dto.exitZoneStart;
    if (dto.exitZoneEnd !== undefined) data.exitZoneEnd = dto.exitZoneEnd;
    if (dto.lateZoneStartTime !== undefined) {
      data.lateZoneStartTime = dto.lateZoneStartTime;
    }
    if (dto.lateZoneEndTime !== undefined) data.lateZoneEndTime = dto.lateZoneEndTime;
    if (dto.earlyLeftZoneStartTime !== undefined) {
      data.earlyLeftZoneStartTime = dto.earlyLeftZoneStartTime;
    }
    if (dto.earlyLeftZoneEndTime !== undefined) {
      data.earlyLeftZoneEndTime = dto.earlyLeftZoneEndTime;
    }
    if (dto.linkedUserId !== undefined) data.linkedUserId = dto.linkedUserId;

    const row = await this.prisma.attendanceUser.update({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
      data,
    });
    return toUserResponse(row);
  }

  async deleteUser(
    user: JwtPayload,
    deviceUserId: string,
  ): Promise<SuccessResponseDto> {
    const schoolId = this.schoolId(user);
    const existing = await this.prisma.attendanceUser.findUnique({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
    });
    if (!existing) {
      throw new NotFoundException('Attendance user not found');
    }
    await this.prisma.attendanceUser.delete({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
    });
    return { success: true };
  }

  async listHolidays(user: JwtPayload): Promise<AttendanceHolidayResponseDto[]> {
    const rows = await this.prisma.attendanceHoliday.findMany({
      where: { schoolId: this.schoolId(user) },
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      date: formatDateLocal(r.date),
      type: HOLIDAY_TYPE_REVERSE[r.type],
    }));
  }

  async addHoliday(
    user: JwtPayload,
    dto: CreateAttendanceHolidayDto,
  ): Promise<SuccessResponseDto> {
    const date = parseLocalDateToDbDate(dto.date);
    if (!date) throw new BadRequestException('Date is required');
    const type = HOLIDAY_TYPE_MAP[dto.type];
    if (!type) throw new BadRequestException('Invalid holiday type');

    await this.prisma.attendanceHoliday.createMany({
      data: [{ schoolId: this.schoolId(user), date, type }],
      skipDuplicates: true,
    });
    return { success: true };
  }

  async addHolidayRange(
    user: JwtPayload,
    dto: CreateAttendanceHolidayRangeDto,
  ): Promise<SuccessResponseDto> {
    const fromDate = parseDateLocal(dto.dateFrom);
    const toDate = parseDateLocal(dto.dateTo);
    if (!fromDate || !toDate) {
      throw new BadRequestException('Invalid date range');
    }
    if (fromDate > toDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    const type = HOLIDAY_TYPE_MAP[dto.type];
    const schoolId = this.schoolId(user);
    let added = 0;
    const cur = new Date(fromDate.getTime());
    while (cur <= toDate) {
      const result = await this.prisma.attendanceHoliday.createMany({
        data: [{ schoolId, date: new Date(cur.getTime()), type }],
        skipDuplicates: true,
      });
      added += result.count;
      cur.setDate(cur.getDate() + 1);
    }
    return { success: true, added };
  }

  async removeHoliday(
    user: JwtPayload,
    id: string,
  ): Promise<SuccessResponseDto> {
    await this.prisma.attendanceHoliday.deleteMany({
      where: { id, schoolId: this.schoolId(user) },
    });
    return { success: true };
  }

  async removeHolidays(
    user: JwtPayload,
    ids: string[],
  ): Promise<SuccessResponseDto> {
    if (!ids.length) return { success: true };
    await this.prisma.attendanceHoliday.deleteMany({
      where: { id: { in: ids }, schoolId: this.schoolId(user) },
    });
    return { success: true };
  }

  async listEmployeeHolidays(
    user: JwtPayload,
  ): Promise<EmployeeHolidayResponseDto[]> {
    const rows = await this.prisma.employeeHoliday.findMany({
      where: { schoolId: this.schoolId(user) },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      deviceUserId: r.deviceUserId,
      date: formatDateLocal(r.date),
    }));
  }

  async addEmployeeHoliday(
    user: JwtPayload,
    dto: CreateEmployeeHolidayDto,
  ): Promise<SuccessResponseDto> {
    const schoolId = this.schoolId(user);
    const deviceUserId = dto.deviceUserId.trim();
    const date = parseLocalDateToDbDate(dto.date);
    if (!deviceUserId || !date) {
      throw new BadRequestException('Employee and date are required');
    }

    await this.ensureAttendanceUser(schoolId, deviceUserId);

    const settings = await this.loadSettingsMap(schoolId);
    const existing = await this.prisma.employeeHoliday.findUnique({
      where: {
        schoolId_deviceUserId_date: { schoolId, deviceUserId, date },
      },
    });
    if (existing) {
      throw new ConflictException('Holiday already registered');
    }

    const balanceRow = await this.prisma.employeeLeaveBalance.findUnique({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
    });
    const currentBalance = balanceRow
      ? balanceRow.balanceDays
      : settings.annual_holidays_days;
    if (currentBalance < 1) {
      throw new BadRequestException(
        `Insufficient leave balance (remaining: ${currentBalance})`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.employeeHoliday.create({
        data: { schoolId, deviceUserId, date },
      });
      if (balanceRow) {
        await tx.employeeLeaveBalance.update({
          where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
          data: { balanceDays: { decrement: 1 } },
        });
      } else {
        await tx.employeeLeaveBalance.create({
          data: {
            schoolId,
            deviceUserId,
            balanceDays: settings.annual_holidays_days - 1,
          },
        });
      }
    });

    return { success: true };
  }

  async addEmployeeHolidayRange(
    user: JwtPayload,
    dto: CreateEmployeeHolidayRangeDto,
  ): Promise<SuccessResponseDto> {
    const schoolId = this.schoolId(user);
    const deviceUserId = dto.deviceUserId.trim();
    const fromDate = parseDateLocal(dto.dateFrom);
    const toDate = parseDateLocal(dto.dateTo);
    if (!deviceUserId || !fromDate || !toDate) {
      throw new BadRequestException('Employee and date range are required');
    }
    if (fromDate > toDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    await this.ensureAttendanceUser(schoolId, deviceUserId);

    const settings = await this.loadSettingsMap(schoolId);
    const balanceRow = await this.prisma.employeeLeaveBalance.findUnique({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
    });
    const currentBalance = balanceRow
      ? balanceRow.balanceDays
      : settings.annual_holidays_days;
    const dayCount =
      Math.ceil((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000)) +
      1;
    if (currentBalance < dayCount) {
      throw new BadRequestException(
        `Insufficient leave balance (remaining: ${currentBalance})`,
      );
    }

    let added = 0;
    const cur = new Date(fromDate.getTime());
    await this.prisma.$transaction(async (tx) => {
      while (cur <= toDate) {
        const date = new Date(cur.getTime());
        const result = await tx.employeeHoliday.createMany({
          data: [{ schoolId, deviceUserId, date }],
          skipDuplicates: true,
        });
        added += result.count;
        cur.setDate(cur.getDate() + 1);
      }
      if (added > 0) {
        if (balanceRow) {
          await tx.employeeLeaveBalance.update({
            where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
            data: { balanceDays: { decrement: added } },
          });
        } else {
          await tx.employeeLeaveBalance.create({
            data: {
              schoolId,
              deviceUserId,
              balanceDays: settings.annual_holidays_days - added,
            },
          });
        }
      }
    });

    return { success: true, added };
  }

  async removeEmployeeHoliday(
    user: JwtPayload,
    id: string,
  ): Promise<SuccessResponseDto> {
    const schoolId = this.schoolId(user);
    const row = await this.prisma.employeeHoliday.findFirst({
      where: { id, schoolId },
    });
    if (!row) throw new NotFoundException('Record not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.employeeHoliday.delete({ where: { id } });
      await tx.employeeLeaveBalance.upsert({
        where: {
          schoolId_deviceUserId: {
            schoolId,
            deviceUserId: row.deviceUserId,
          },
        },
        create: {
          schoolId,
          deviceUserId: row.deviceUserId,
          balanceDays: 1,
        },
        update: { balanceDays: { increment: 1 } },
      });
    });

    return { success: true };
  }

  async removeEmployeeHolidays(
    user: JwtPayload,
    ids: string[],
  ): Promise<SuccessResponseDto> {
    if (!ids.length) return { success: true };
    const schoolId = this.schoolId(user);
    const rows = await this.prisma.employeeHoliday.findMany({
      where: { id: { in: ids }, schoolId },
    });
    const countByUser = new Map<string, number>();
    for (const r of rows) {
      countByUser.set(
        r.deviceUserId,
        (countByUser.get(r.deviceUserId) ?? 0) + 1,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.employeeHoliday.deleteMany({
        where: { id: { in: ids }, schoolId },
      });
      for (const [deviceUserId, count] of countByUser) {
        await tx.employeeLeaveBalance.upsert({
          where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
          create: { schoolId, deviceUserId, balanceDays: count },
          update: { balanceDays: { increment: count } },
        });
      }
    });

    return { success: true };
  }

  async listTimeLeaveUsage(
    user: JwtPayload,
  ): Promise<TimeLeaveUsageResponseDto[]> {
    const rows = await this.prisma.timeLeaveUsage.findMany({
      where: { schoolId: this.schoolId(user) },
      orderBy: { date: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      deviceUserId: r.deviceUserId,
      date: formatDateLocal(r.date),
      timestamp: formatLocalTimestamp(r.timestamp),
      type: TIME_LEAVE_TYPE_REVERSE[r.type],
    }));
  }

  async addTimeLeaveUsage(
    user: JwtPayload,
    dto: CreateTimeLeaveUsageDto,
  ): Promise<SuccessResponseDto> {
    const schoolId = this.schoolId(user);
    const deviceUserId = dto.deviceUserId.trim();
    const date = parseLocalDateToDbDate(dto.date);
    const ts = parseLocalTimestamp(dto.timestamp);
    if (!deviceUserId || !date || !ts) {
      throw new BadRequestException('User ID, date, and timestamp are required');
    }

    const type = TIME_LEAVE_TYPE_MAP[dto.type];
    if (!type) throw new BadRequestException('Invalid type');

    await this.ensureAttendanceUser(schoolId, deviceUserId);

    const settings = await this.loadSettingsMap(schoolId);

    const existing = await this.prisma.timeLeaveUsage.findUnique({
      where: {
        schoolId_deviceUserId_timestamp_type: {
          schoolId,
          deviceUserId,
          timestamp: ts,
          type,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Already registered');
    }

    const tempCount = await this.prisma.timeLeaveUsage.count({
      where: { schoolId, deviceUserId },
    });
    const ratio = settings.temp_holidays_per_full_holiday;
    const fullUsedBefore = ratio > 0 ? Math.floor(tempCount / ratio) : 0;
    const fullUsedAfter = ratio > 0 ? Math.floor((tempCount + 1) / ratio) : 0;

    const balanceRow = await this.prisma.employeeLeaveBalance.findUnique({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
    });
    const balanceDays = balanceRow
      ? balanceRow.balanceDays
      : settings.annual_holidays_days;

    if (fullUsedAfter > balanceDays) {
      throw new BadRequestException(
        `Insufficient leave balance (remaining: ${balanceDays}). Set balance first.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.timeLeaveUsage.create({
        data: {
          schoolId,
          deviceUserId,
          date,
          timestamp: ts,
          type,
        },
      });
      const fullToDeduct = fullUsedAfter - fullUsedBefore;
      if (fullToDeduct > 0) {
        if (balanceRow) {
          await tx.employeeLeaveBalance.update({
            where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
            data: { balanceDays: { decrement: fullToDeduct } },
          });
        } else {
          await tx.employeeLeaveBalance.create({
            data: {
              schoolId,
              deviceUserId,
              balanceDays: settings.annual_holidays_days - fullUsedAfter,
            },
          });
        }
      }
    });

    return { success: true };
  }

  async removeTimeLeaveUsage(
    user: JwtPayload,
    id: string,
  ): Promise<SuccessResponseDto> {
    const schoolId = this.schoolId(user);
    const row = await this.prisma.timeLeaveUsage.findFirst({
      where: { id, schoolId },
    });
    if (!row) throw new NotFoundException('Record not found');

    const settings = await this.loadSettingsMap(schoolId);
    const tempCount = await this.prisma.timeLeaveUsage.count({
      where: { schoolId, deviceUserId: row.deviceUserId },
    });
    const ratio = settings.temp_holidays_per_full_holiday;
    const fullUsedBefore = ratio > 0 ? Math.floor(tempCount / ratio) : 0;

    await this.prisma.$transaction(async (tx) => {
      await tx.timeLeaveUsage.delete({ where: { id } });
      const fullUsedAfter =
        ratio > 0 ? Math.floor((tempCount - 1) / ratio) : 0;
      const fullToRestore = fullUsedBefore - fullUsedAfter;
      if (fullToRestore > 0) {
        await tx.employeeLeaveBalance.upsert({
          where: {
            schoolId_deviceUserId: {
              schoolId,
              deviceUserId: row.deviceUserId,
            },
          },
          create: {
            schoolId,
            deviceUserId: row.deviceUserId,
            balanceDays: fullToRestore,
          },
          update: { balanceDays: { increment: fullToRestore } },
        });
      }
    });

    return { success: true };
  }

  async listLeaveBalances(
    user: JwtPayload,
  ): Promise<LeaveBalanceResponseDto[]> {
    const rows = await this.prisma.employeeLeaveBalance.findMany({
      where: { schoolId: this.schoolId(user) },
      orderBy: { deviceUserId: 'asc' },
    });
    return rows.map((r) => ({
      deviceUserId: r.deviceUserId,
      balanceDays: r.balanceDays,
    }));
  }

  async setLeaveBalance(
    user: JwtPayload,
    deviceUserId: string,
    dto: SetLeaveBalanceDto,
  ): Promise<LeaveBalanceResponseDto> {
    const schoolId = this.schoolId(user);
    if (Number.isNaN(dto.balanceDays)) {
      throw new BadRequestException('Invalid balance');
    }
    await this.ensureAttendanceUser(schoolId, deviceUserId);
    const row = await this.prisma.employeeLeaveBalance.upsert({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
      create: { schoolId, deviceUserId, balanceDays: dto.balanceDays },
      update: { balanceDays: dto.balanceDays },
    });
    return { deviceUserId: row.deviceUserId, balanceDays: row.balanceDays };
  }

  async getEmployeeReport(
    user: JwtPayload,
    query: EmployeeReportQueryDto,
  ): Promise<EmployeeReportResponseDto> {
    const schoolId = this.schoolId(user);
    const fromDate = query.fromDate ?? '';
    const toDate = query.toDate ?? '';

    const [
      records,
      users,
      settings,
      holidays,
      timeLeaveUsage,
      employeeHolidays,
    ] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where: { schoolId },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.attendanceUser.findMany({ where: { schoolId } }),
      this.loadSettingsMap(schoolId),
      this.prisma.attendanceHoliday.findMany({ where: { schoolId } }),
      this.prisma.timeLeaveUsage.findMany({ where: { schoolId } }),
      this.prisma.employeeHoliday.findMany({ where: { schoolId } }),
    ]);

    const userInputs = users.map(toUserScheduleInput);
    const recordInputs = records.map((r) => ({
      deviceUserId: r.deviceUserId,
      timestamp: r.timestamp,
      verifyType: r.verifyType,
    }));

    const earlyExitDates = holidays
      .filter((h) => h.type === AttendanceHolidayType.EARLY_EXIT)
      .map((h) => ({ date: formatDateLocal(h.date), type: 'early_exit' }));
    const lateEntryDates = holidays
      .filter((h) => h.type === AttendanceHolidayType.ENTRY_LATE)
      .map((h) => ({ date: formatDateLocal(h.date), type: 'entry_late' }));
    const dayOffDates = holidays
      .filter((h) => h.type === AttendanceHolidayType.DAY_OFF)
      .map((h) => ({ date: formatDateLocal(h.date), type: 'day_off' }));

    const tlInputs = timeLeaveUsage.map((t) => ({
      deviceUserId: t.deviceUserId,
      date: formatDateLocal(t.date),
      timestamp: formatLocalTimestamp(t.timestamp),
      type: TIME_LEAVE_TYPE_REVERSE[t.type],
    }));

    const empHolidayInputs = employeeHolidays.map((h) => ({
      deviceUserId: h.deviceUserId,
      date: formatDateLocal(h.date),
    }));

    const reportInput = {
      records: recordInputs,
      settings,
      users: userInputs,
      timeLeaveUsage: tlInputs,
      earlyExitDates,
      lateEntryDates,
      dayOffDates,
      employeeHolidays: empHolidayInputs,
      fromDate,
      toDate,
    };

    const rows = buildEmployeeReport(reportInput).map((r) => ({
      deviceUserId: r.deviceUserId,
      workingDaysPresent: r.working_days_present,
      lateCount: r.late_count,
      expectedWorkingDays: r.expected_working_days,
      daysAbsent: r.days_absent,
    }));

    const lateOccurrences = findLateOccurrences(reportInput);
    const earlyExitOccurrences = findEarlyExitOccurrences(reportInput);

    return {
      rows,
      lateOccurrences,
      earlyExitOccurrences,
    };
  }

  private async ensureAttendanceUser(
    schoolId: string,
    deviceUserId: string,
  ): Promise<void> {
    const row = await this.prisma.attendanceUser.findUnique({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId } },
    });
    if (!row) {
      throw new NotFoundException('Attendance user not found');
    }
  }
}
