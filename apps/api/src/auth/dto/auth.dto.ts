import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUsername } from '../validators/is-username.validator';

export class RegisterDto {
  @ApiProperty({ example: 'employee@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'School code to register under',
    example: 'QALAM001',
  })
  @IsString()
  @IsNotEmpty()
  schoolCode: string;
}

export class RegisterSchoolDto {
  @ApiProperty({ example: 'Qalam International School' })
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @ApiProperty({ example: 'QALAM001' })
  @IsString()
  @IsNotEmpty()
  schoolCode: string;

  @ApiProperty({ example: 'manager@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Manager' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'jane.doe',
    description: 'Username or email address',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SetCredentialsDto {
  @ApiProperty({ example: 'jane.doe', minLength: 3, maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @IsUsername()
  username: string;

  @ApiProperty({ minLength: 8, example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass123!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ minLength: 8, example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class GoogleMobileLoginDto {
  @ApiProperty({ description: 'Google ID token from the Android OAuth client' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
