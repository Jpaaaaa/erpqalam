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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const refresh_token_store_1 = require("./interfaces/refresh-token.store");
const BCRYPT_ROUNDS = 12;
function resolvePermissions(role, permissions) {
    if (role === client_1.UserRole.MANAGER) {
        return [];
    }
    return permissions ?? [];
}
let AuthService = class AuthService {
    constructor(prisma, jwtService, config, refreshTokenStore) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.refreshTokenStore = refreshTokenStore;
    }
    async registerSchool(dto) {
        const existingSchool = await this.prisma.school.findUnique({
            where: { code: dto.schoolCode },
        });
        if (existingSchool) {
            throw new common_1.ConflictException('School code already exists');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = await this.prisma.$transaction(async (tx) => {
            const school = await tx.school.create({
                data: {
                    name: dto.schoolName,
                    code: dto.schoolCode,
                },
            });
            return tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    phone: dto.phone,
                    role: client_1.UserRole.MANAGER,
                    status: client_1.UserStatus.ACTIVE,
                    schoolId: school.id,
                },
            });
        });
        return this.buildAuthResponse(user);
    }
    async register(dto) {
        const school = await this.prisma.school.findUnique({
            where: { code: dto.schoolCode },
        });
        if (!school) {
            throw new common_1.ConflictException('Invalid school code');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                role: client_1.UserRole.EMPLOYEE,
                status: client_1.UserStatus.PENDING,
                schoolId: school.id,
            },
        });
        return this.toAuthUser(user);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== client_1.UserStatus.ACTIVE) {
            throw new common_1.ForbiddenException(user.status === client_1.UserStatus.PENDING
                ? 'Account pending manager approval'
                : 'Account is inactive');
        }
        return this.buildAuthResponse(user);
    }
    async loginWithGoogle(profile) {
        let user = await this.prisma.user.findUnique({
            where: { email: profile.email },
        });
        if (!user) {
            user = await this.createGoogleUser(profile);
        }
        else if (this.isGoogleAutoAdmin(profile.email)) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    role: client_1.UserRole.MANAGER,
                    status: client_1.UserStatus.ACTIVE,
                },
            });
        }
        if (user.status !== client_1.UserStatus.ACTIVE) {
            throw new common_1.ForbiddenException(user.status === client_1.UserStatus.PENDING
                ? 'Account pending manager approval'
                : 'Account is inactive');
        }
        return this.buildAuthResponse(user);
    }
    isGoogleAutoAdmin(email) {
        const autoAdminEmails = this.config.get('google.autoAdminEmails') ?? [];
        return autoAdminEmails.includes(email.toLowerCase());
    }
    async createGoogleUser(profile) {
        const schoolCode = this.config.get('google.defaultSchoolCode', 'QALAM001');
        const school = await this.prisma.school.findUnique({
            where: { code: schoolCode },
        });
        if (!school) {
            throw new common_1.BadRequestException('Google sign-in is not configured for new users');
        }
        const passwordHash = await bcrypt.hash((0, crypto_1.randomBytes)(32).toString('hex'), BCRYPT_ROUNDS);
        const isAutoAdmin = this.isGoogleAutoAdmin(profile.email);
        return this.prisma.user.create({
            data: {
                email: profile.email,
                passwordHash,
                firstName: profile.firstName || 'Google',
                lastName: profile.lastName || 'User',
                role: isAutoAdmin ? client_1.UserRole.MANAGER : client_1.UserRole.EMPLOYEE,
                status: isAutoAdmin ? client_1.UserStatus.ACTIVE : client_1.UserStatus.PENDING,
                schoolId: school.id,
            },
        });
    }
    async refresh(refreshToken) {
        const record = await this.refreshTokenStore.find(refreshToken);
        if (!record || record.expiresAt < new Date()) {
            if (record) {
                await this.refreshTokenStore.revoke(refreshToken);
            }
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: record.userId },
        });
        if (!user || user.status !== client_1.UserStatus.ACTIVE) {
            await this.refreshTokenStore.revoke(refreshToken);
            throw new common_1.UnauthorizedException('User no longer active');
        }
        await this.refreshTokenStore.revoke(refreshToken);
        return this.buildAuthResponse(user);
    }
    async logout(refreshToken) {
        await this.refreshTokenStore.revoke(refreshToken);
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.toAuthUser(user);
    }
    async buildAuthResponse(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: resolvePermissions(user.role, user.permissions),
            schoolId: user.schoolId,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = (0, crypto_1.randomBytes)(64).toString('hex');
        const expiresAt = this.getRefreshExpiry();
        await this.refreshTokenStore.save(user.id, refreshToken, expiresAt);
        return {
            user: this.toAuthUser(user),
            tokens: { accessToken, refreshToken },
        };
    }
    toAuthUser(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            permissions: resolvePermissions(user.role, user.permissions),
            status: user.status,
            schoolId: user.schoolId,
        };
    }
    getRefreshExpiry() {
        const expiresIn = this.config.get('jwt.refreshExpiresIn', '7d');
        return new Date(Date.now() + this.parseExpiry(expiresIn));
    }
    parseExpiry(value) {
        const match = value.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 7 * 24 * 60 * 60 * 1000;
        }
        const amount = parseInt(match[1], 10);
        const multipliers = {
            s: 1000,
            m: 60_000,
            h: 3_600_000,
            d: 86_400_000,
        };
        return amount * (multipliers[match[2]] ?? 86_400_000);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(refresh_token_store_1.REFRESH_TOKEN_STORE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map