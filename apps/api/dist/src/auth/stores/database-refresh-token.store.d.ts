import { PrismaService } from '../../database/prisma.service';
import { RefreshTokenRecord, RefreshTokenStore } from '../interfaces/refresh-token.store';
export declare class DatabaseRefreshTokenStore implements RefreshTokenStore {
    private readonly prisma;
    constructor(prisma: PrismaService);
    save(userId: string, token: string, expiresAt: Date): Promise<void>;
    find(token: string): Promise<RefreshTokenRecord | null>;
    revoke(token: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
}
