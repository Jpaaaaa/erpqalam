import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UserPermission, UserRole } from '@generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { DocumentRequestsService } from './document-requests.service';
import {
  CreateDocumentRequestDto,
  CheckDocumentNumberQueryDto,
  CheckDocumentNumberResponseDto,
  DocumentRequestCreateDefaultsResponseDto,
  DocumentRequestLetterResponseDto,
  DocumentRequestSettingsResponseDto,
  ListDocumentRequestsQueryDto,
  PaginatedDocumentRequestsResponseDto,
  UpdateDocumentRequestSettingsDto,
} from './dto/document-requests.dto';

@ApiTags('document-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('document-requests')
export class DocumentRequestsController {
  constructor(
    private readonly documentRequestsService: DocumentRequestsService,
  ) {}

  @Get('settings')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get document number settings (manager only)' })
  @ApiResponse({ status: 200, type: DocumentRequestSettingsResponseDto })
  getSettings(
    @CurrentUser() user: JwtPayload,
  ): Promise<DocumentRequestSettingsResponseDto> {
    return this.documentRequestsService.getSettings(user);
  }

  @Patch('settings')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Update document number prefix / starting number' })
  @ApiResponse({ status: 200, type: DocumentRequestSettingsResponseDto })
  updateSettings(
    @Body() dto: UpdateDocumentRequestSettingsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DocumentRequestSettingsResponseDto> {
    return this.documentRequestsService.updateSettings(user, dto);
  }

  @Get('defaults')
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({
    summary: 'Defaults for the create document request modal',
  })
  @ApiResponse({ status: 200, type: DocumentRequestCreateDefaultsResponseDto })
  getCreateDefaults(
    @CurrentUser() user: JwtPayload,
  ): Promise<DocumentRequestCreateDefaultsResponseDto> {
    return this.documentRequestsService.getCreateDefaults(user);
  }

  @Get('check-number')
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Check whether a document number is already used' })
  @ApiResponse({ status: 200, type: CheckDocumentNumberResponseDto })
  checkDocumentNumber(
    @Query() query: CheckDocumentNumberQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CheckDocumentNumberResponseDto> {
    return this.documentRequestsService.checkDocumentNumber(user, query);
  }

  @Get()
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'List generated document request letters' })
  @ApiResponse({ status: 200, type: PaginatedDocumentRequestsResponseDto })
  findAll(
    @Query() query: ListDocumentRequestsQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedDocumentRequestsResponseDto> {
    return this.documentRequestsService.findAll(user, query);
  }

  @Post()
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Generate a document request letter PDF' })
  @ApiResponse({ status: 201, type: DocumentRequestLetterResponseDto })
  async create(
    @Body() dto: CreateDocumentRequestDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    const { pdf, letter } = await this.documentRequestsService.create(
      user,
      dto,
    );

    const filename = encodeURIComponent(
      `document-request-${letter.documentNumber}.pdf`,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
    );
    res.setHeader('X-Document-Number', encodeURIComponent(letter.documentNumber));
    res.setHeader('X-Document-Id', letter.id);
    res.status(201).send(pdf);
  }

  @Get(':id/pdf')
  @Permissions(UserPermission.STUDENT_REGISTRATION)
  @ApiOperation({ summary: 'Download a previously generated document request PDF' })
  async getPdf(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    const { pdf, letter } = await this.documentRequestsService.getPdf(user, id);

    const filename = encodeURIComponent(
      `document-request-${letter.documentNumber}.pdf`,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${filename}"; filename*=UTF-8''${filename}`,
    );
    res.setHeader('X-Document-Number', encodeURIComponent(letter.documentNumber));
    res.setHeader('X-Document-Id', letter.id);
    res.status(200).send(pdf);
  }
}
