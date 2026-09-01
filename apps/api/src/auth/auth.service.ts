import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserRole, UserStatus } from '@generated/prisma/client';
import { resolvePermissions } from '../common/permissions/permissions';
import { PrismaService } from '../database/prisma.service';
import {
  LoginDto,
  RegisterDto,
  RegisterSchoolDto,
} from './dto/auth.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  REFRESH_TOKEN_STORE,
  RefreshTokenStore,
} from './interfaces/refresh-token.store';
import { GoogleOAuthProfile } from './interfaces/google-profile.interface';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REFRESH_TOKEN_STORE)
    private readonly refreshTokenStore: RefreshTokenStore,
  ) {}

  async registerSchool(dto: RegisterSchoolDto): Promise<AuthResponseDto> {
    const existingSchool = await this.prisma.school.findUnique({
      where: { code: dto.schoolCode },
    });

    if (existingSchool) {
      throw new ConflictException('School code already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
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
          role: UserRole.MANAGER,
          status: UserStatus.ACTIVE,
          schoolId: school.id,
        },
      });
    });

    return this.buildAuthResponse(user);
  }

  async register(dto: RegisterDto): Promise<AuthUserDto> {
    const school = await this.prisma.school.findUnique({
      where: { code: dto.schoolCode },
    });

    if (!school) {
      throw new ConflictException('Invalid school code');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: UserRole.EMPLOYEE,
        status: UserStatus.PENDING,
        schoolId: school.id,
      },
    });

    return this.toAuthUser(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        user.status === UserStatus.PENDING
          ? 'Account pending manager approval'
          : 'Account is inactive',
      );
    }

    return this.buildAuthResponse(user);
  }

  async loginWithGoogle(profile: GoogleOAuthProfile): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.createGoogleUser(profile);
    } else if (this.isGoogleAutoAdmin(profile.email)) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: UserRole.MANAGER,
          status: UserStatus.ACTIVE,
        },
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        user.status === UserStatus.PENDING
          ? 'Account pending manager approval'
          : 'Account is inactive',
      );
    }

    return this.buildAuthResponse(user);
  }

  private isGoogleAutoAdmin(email: string): boolean {
    const autoAdminEmails =
      this.config.get<string[]>('google.autoAdminEmails') ?? [];
    return autoAdminEmails.includes(email.toLowerCase());
  }

  private async createGoogleUser(profile: GoogleOAuthProfile) {
    const schoolCode = this.config.get<string>(
      'google.defaultSchoolCode',
      'QALAM001',
    );

    const school = await this.prisma.school.findUnique({
      where: { code: schoolCode },
    });

    if (!school) {
      throw new BadRequestException(
        'Google sign-in is not configured for new users',
      );
    }

    const passwordHash = await bcrypt.hash(
      randomBytes(32).toString('hex'),
      BCRYPT_ROUNDS,
    );

    const isAutoAdmin = this.isGoogleAutoAdmin(profile.email);

    return this.prisma.user.create({
      data: {
        email: profile.email,
        passwordHash,
        firstName: profile.firstName || 'Google',
        lastName: profile.lastName || 'User',
        role: isAutoAdmin ? UserRole.MANAGER : UserRole.EMPLOYEE,
        status: isAutoAdmin ? UserStatus.ACTIVE : UserStatus.PENDING,
        schoolId: school.id,
      },
    });
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const record = await this.refreshTokenStore.find(refreshToken);

    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await this.refreshTokenStore.revoke(refreshToken);
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      await this.refreshTokenStore.revoke(refreshToken);
      throw new UnauthorizedException('User no longer active');
    }

    await this.refreshTokenStore.revoke(refreshToken);

    return this.buildAuthResponse(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenStore.revoke(refreshToken);
  }

  async getProfile(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthUser(user);
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: UserRole;
    permissions: string[];
    status: UserStatus;
    schoolId: string;
  }): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: resolvePermissions(user.role, user.permissions),
      schoolId: user.schoolId,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = this.getRefreshExpiry();

    await this.refreshTokenStore.save(user.id, refreshToken, expiresAt);

    return {
      user: this.toAuthUser(user),
      tokens: { accessToken, refreshToken },
    };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: UserRole;
    permissions?: string[] | null;
    status: UserStatus;
    schoolId: string;
  }): AuthUserDto {
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

  private getRefreshExpiry(): Date {
    const expiresIn = this.config.get<string>('jwt.refreshExpiresIn', '7d');
    return new Date(Date.now() + this.parseExpiry(expiresIn));
  }

  private parseExpiry(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return amount * (multipliers[match[2]] ?? 86_400_000);
  }
}
