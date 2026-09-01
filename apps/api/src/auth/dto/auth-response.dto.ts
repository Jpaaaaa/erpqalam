import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@generated/prisma/client';

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  phone?: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: [String] })
  permissions: string[];

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  schoolId: string;
}

export class AuthTokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens: AuthTokensDto;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
