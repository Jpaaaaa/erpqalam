import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  RefreshTokenRecord,
  RefreshTokenStore,
} from '../interfaces/refresh-token.store';

@Injectable()
export class DatabaseRefreshTokenStore implements RefreshTokenStore {
  constructor(private readonly prisma: PrismaService) {}

  async save(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async find(token: string): Promise<RefreshTokenRecord | null> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true },
    });

    return record;
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
