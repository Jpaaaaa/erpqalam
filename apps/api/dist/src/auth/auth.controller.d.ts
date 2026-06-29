import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto, RefreshTokenDto, RegisterDto, RegisterSchoolDto } from './dto/auth.dto';
import { AuthResponseDto, AuthUserDto, MessageResponseDto } from './dto/auth-response.dto';
import { GoogleOAuthProfile } from './interfaces/google-profile.interface';
export declare class AuthController {
    private readonly authService;
    private readonly config;
    constructor(authService: AuthService, config: ConfigService);
    registerSchool(dto: RegisterSchoolDto): Promise<AuthResponseDto>;
    register(dto: RegisterDto): Promise<AuthUserDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    me(user: JwtPayload): Promise<AuthUserDto>;
    googleAuth(): void;
    googleAuthCallback(req: Request & {
        user: GoogleOAuthProfile;
    }, res: Response): Promise<void>;
    private getOAuthLocale;
    refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(dto: RefreshTokenDto): Promise<MessageResponseDto>;
}
