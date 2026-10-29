import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { getClientIp } from './client-ip.util';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  GoogleMobileLoginDto,
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RegisterSchoolDto,
  SetCredentialsDto,
} from './dto/auth.dto';
import {
  AuthResponseDto,
  AuthUserDto,
  MessageResponseDto,
} from './dto/auth-response.dto';
import { GoogleOAuthProfile } from './interfaces/google-profile.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register-school')
  @ApiOperation({ summary: 'Bootstrap a new school with its first manager' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  registerSchool(@Body() dto: RegisterSchoolDto): Promise<AuthResponseDto> {
    return this.authService.registerSchool(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Employee self-registration (pending approval)' })
  @ApiResponse({ status: 201, type: AuthUserDto })
  register(@Body() dto: RegisterDto): Promise<AuthUserDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username or email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ip = getClientIp(req);
    const rateLimitKey = `${ip}:${dto.login.trim().toLowerCase()}`;
    return this.authService.login(dto, rateLimitKey);
  }

  @Post('set-credentials')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set username and password after Google sign-in' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  setCredentials(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SetCredentialsDto,
  ): Promise<AuthResponseDto> {
    return this.authService.setCredentials(user.sub, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (required when mustChangePassword)' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<AuthResponseDto> {
    return this.authService.changePassword(user.sub, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile with fresh permissions' })
  @ApiResponse({ status: 200, type: AuthUserDto })
  me(@CurrentUser() user: JwtPayload): Promise<AuthUserDto> {
    return this.authService.getProfile(user.sub);
  }

  @Post('google/mobile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with a Google ID token from the Android app',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  googleMobileLogin(
    @Body() dto: GoogleMobileLoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.loginWithGoogleIdToken(dto.idToken);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth consent screen' })
  googleAuth(): void {
    // Passport redirects to Google.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback — issues JWT tokens' })
  async googleAuthCallback(
    @Req() req: Request & { user: GoogleOAuthProfile },
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.config.get<string>(
      'google.frontendUrl',
      'http://localhost:3001',
    );
    const locale = this.getOAuthLocale(req) ?? 'en';
    const loginPath = `/${locale}/login`;
    const callbackPath = `/${locale}/auth/google/callback`;

    try {
      const authResponse = await this.authService.loginWithGoogle(req.user);
      const params = new URLSearchParams({
        accessToken: authResponse.tokens.accessToken,
        refreshToken: authResponse.tokens.refreshToken,
        user: Buffer.from(JSON.stringify(authResponse.user)).toString(
          'base64url',
        ),
      });

      res.redirect(`${frontendUrl}${callbackPath}?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Google sign-in failed';
      res.redirect(
        `${frontendUrl}${loginPath}?error=${encodeURIComponent(message)}`,
      );
    }
  }

  private getOAuthLocale(req: Request): string | undefined {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;

    const match = cookieHeader.match(/(?:^|;\s*)oauth_locale=([^;]+)/);
    return match?.[1];
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async logout(@Body() dto: RefreshTokenDto): Promise<MessageResponseDto> {
    await this.authService.logout(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }
}
