import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import {
  parseAttlogBody,
  parseDeviceUserBody,
  shouldApplyDeviceUserName,
} from './iclock.parser';

export type ResolvedIclockDevice = {
  id: string;
  schoolId: string;
  serialNumber: string;
};

@Injectable()
export class IclockService {
  private readonly logger = new Logger(IclockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async touchDevice(
    serialNumber: string,
  ): Promise<ResolvedIclockDevice | null> {
    const sn = serialNumber?.trim();
    if (!sn) {
      this.logger.warn('iclock request missing SN query parameter');
      return null;
    }

    let device = await this.prisma.attendanceDevice.findUnique({
      where: { serialNumber: sn },
    });

    if (!device) {
      const autoRegister =
        this.config.get<string>('ICLOCK_AUTO_REGISTER') === 'true' ||
        process.env.ICLOCK_AUTO_REGISTER === 'true';

      if (autoRegister) {
        const school = await this.prisma.school.findFirst({
          orderBy: { createdAt: 'asc' },
        });
        if (school) {
          device = await this.prisma.attendanceDevice.create({
            data: {
              schoolId: school.id,
              serialNumber: sn,
              name: sn,
            },
          });
          this.logger.log(
            `Auto-registered iclock device SN=${sn} for school ${school.id}`,
          );
        }
      }
    }

    if (!device) {
      this.logger.warn(
        `Unknown iclock device SN=${sn} — responding OK without storing data`,
      );
      return null;
    }

    await this.prisma.attendanceDevice.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });

    return {
      id: device.id,
      schoolId: device.schoolId,
      serialNumber: device.serialNumber,
    };
  }

  async ingestAttlog(serialNumber: string, body: string): Promise<number> {
    const device = await this.touchDevice(serialNumber);
    if (!device) {
      return 0;
    }

    const parsed = parseAttlogBody(body);
    if (parsed.length === 0) {
      return 0;
    }

    const result = await this.prisma.attendanceRecord.createMany({
      data: parsed.map((row) => ({
        schoolId: device.schoolId,
        deviceUserId: row.deviceUserId,
        timestamp: row.timestamp,
        verifyType: row.verifyType,
        deviceSerial: device.serialNumber,
      })),
      skipDuplicates: true,
    });

    if (result.count > 0) {
      this.logger.log(
        `Stored ${result.count} ATTLOG row(s) from SN=${device.serialNumber}`,
      );
    }

    return result.count;
  }

  async ingestUserData(serialNumber: string, body: string): Promise<number> {
    const device = await this.touchDevice(serialNumber);
    if (!device) {
      return 0;
    }

    const users = parseDeviceUserBody(body);
    if (users.length === 0) {
      return 0;
    }

    let upserted = 0;
    for (const row of users) {
      const applied = await this.upsertDeviceUser(
        device.schoolId,
        row.deviceUserId,
        row.name,
      );
      if (applied) upserted++;
    }

    if (upserted > 0) {
      this.logger.log(
        `Upserted ${upserted} user name(s) from SN=${device.serialNumber}`,
      );
    }

    return upserted;
  }

  async ingestOperlog(serialNumber: string, body: string): Promise<void> {
    const preview = body.length > 500 ? `${body.slice(0, 500)}…` : body;
    this.logger.debug(`OPERLOG from SN=${serialNumber}: ${preview}`);

    const device = await this.touchDevice(serialNumber);
    if (!device) {
      return;
    }

    const users = parseDeviceUserBody(body);
    if (users.length === 0) {
      return;
    }

    let upserted = 0;
    for (const row of users) {
      const applied = await this.upsertDeviceUser(
        device.schoolId,
        row.deviceUserId,
        row.name,
      );
      if (applied) upserted++;
    }

    if (upserted > 0) {
      this.logger.log(
        `Upserted ${upserted} user name(s) from OPERLOG SN=${serialNumber}`,
      );
    }
  }

  private async upsertDeviceUser(
    schoolId: string,
    deviceUserId: string,
    name: string,
  ): Promise<boolean> {
    const id = deviceUserId.trim();
    if (!id) return false;

    const existing = await this.prisma.attendanceUser.findUnique({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId: id } },
    });

    if (!existing) {
      await this.prisma.attendanceUser.create({
        data: {
          schoolId,
          deviceUserId: id,
          name: name.trim() || id,
        },
      });
      return true;
    }

    if (!shouldApplyDeviceUserName(id, name, existing.name)) {
      return false;
    }

    await this.prisma.attendanceUser.update({
      where: { schoolId_deviceUserId: { schoolId, deviceUserId: id } },
      data: { name: name.trim() },
    });
    return true;
  }
}
