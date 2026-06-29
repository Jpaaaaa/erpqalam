import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
export declare class HealthController {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    check(): Promise<{
        status: string;
        postgres: "up" | "down";
        cache: string;
        redis: string;
    }>;
}
