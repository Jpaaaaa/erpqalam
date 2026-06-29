import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { LoginDto, RegisterDto, RegisterSchoolDto } from './dto/auth.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { RefreshTokenStore } from './interfaces/refresh-token.store';
import { GoogleOAuthProfile } from './interfaces/google-profile.interface';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    private readonly refreshTokenStore;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService, refreshTokenStore: RefreshTokenStore);
    registerSchool(dto: RegisterSchoolDto): Promise<AuthResponseDto>;
    register(dto: RegisterDto): Promise<AuthUserDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    loginWithGoogle(profile: GoogleOAuthProfile): Promise<AuthResponseDto>;
    private isGoogleAutoAdmin;
    private createGoogleUser;
    refresh(refreshToken: string): Promise<AuthResponseDto>;
    logout(refreshToken: string): Promise<void>;
    getProfile(userId: string): Promise<AuthUserDto>;
    private buildAuthResponse;
    private toAuthUser;
    private getRefreshExpiry;
    private parseExpiry;
}
