import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RegisterSchoolDto,
} from './dto/auth.dto';
import {
  AuthResponseDto,
  AuthUserDto,
  MessageResponseDto,
} from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
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
