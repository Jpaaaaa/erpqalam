"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRefreshTokenStore = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let DatabaseRefreshTokenStore = class DatabaseRefreshTokenStore {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(userId, token, expiresAt) {
        await this.prisma.refreshToken.create({
            data: { userId, token, expiresAt },
        });
    }
    async find(token) {
        const record = await this.prisma.refreshToken.findUnique({
            where: { token },
            select: { userId: true, expiresAt: true },
        });
        return record;
    }
    async revoke(token) {
        await this.prisma.refreshToken.deleteMany({ where: { token } });
    }
    async revokeAllForUser(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
};
exports.DatabaseRefreshTokenStore = DatabaseRefreshTokenStore;
exports.DatabaseRefreshTokenStore = DatabaseRefreshTokenStore = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DatabaseRefreshTokenStore);
//# sourceMappingURL=database-refresh-token.store.js.map