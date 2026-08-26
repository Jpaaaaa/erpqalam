import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { UserRole } from '@generated/prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BackupService } from './backup.service';
import { BackupReportService } from './backup-report.service';
import { BackupSettingsService } from './backup-settings.service';
import {
  BackupSettingsResponseDto,
  DetectTelegramChatsDto,
  DetectTelegramChatsResponseDto,
  RestoreBackupDto,
  RestoreBackupResponseDto,
  SendBackupNowResponseDto,
  SendReportNowDto,
  SendReportNowResponseDto,
  UpsertBackupSettingsDto,
} from './dto/backup-settings.dto';

@ApiTags('backup-settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('backup-settings')
export class BackupSettingsController {
  constructor(
    private readonly settingsService: BackupSettingsService,
    private readonly backupService: BackupService,
    private readonly reportService: BackupReportService,
  ) {}

  @Get()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get backup / Telegram settings (manager only)' })
  @ApiResponse({ status: 200, type: BackupSettingsResponseDto })
  get(): Promise<BackupSettingsResponseDto> {
    return this.settingsService.get();
  }

  @Post()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Create or update backup settings (manager only)' })
  @ApiResponse({ status: 200, type: BackupSettingsResponseDto })
  upsert(
    @Body() dto: UpsertBackupSettingsDto,
  ): Promise<BackupSettingsResponseDto> {
    return this.settingsService.upsert(dto);
  }

  @Post('detect-chats')
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary:
      'Detect Telegram chat IDs from recent messages to the bot (manager only)',
  })
  @ApiResponse({ status: 200, type: DetectTelegramChatsResponseDto })
  async detectChats(
    @Body() dto: DetectTelegramChatsDto,
  ): Promise<DetectTelegramChatsResponseDto> {
    const fromBody = dto.botToken?.trim();
    let token = fromBody ?? '';

    if (!token) {
      const saved = await this.settingsService.get();
      token = saved.botToken?.trim() ?? '';
    }

    if (!token) {
      throw new BadRequestException(
        'Enter a Telegram bot token first, then message the bot and try again',
      );
    }

    const chats = await this.backupService.detectTelegramChats(token);
    return { chats };
  }

  @Post('run-now')
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary: 'Create a backup zip immediately and download it (manager only)',
  })
  async runNow(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { zipPath, fileName } = await this.backupService.createBackup();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );

    const stream = createReadStream(zipPath);
    stream.on('close', () => {
      void this.backupService.cleanupBackupArtifact(zipPath);
    });
    stream.on('error', () => {
      void this.backupService.cleanupBackupArtifact(zipPath);
    });

    return new StreamableFile(stream);
  }

  @Post('send-now')
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary:
      'Create a backup and send it to all configured Telegram chat IDs (manager only)',
  })
  @ApiResponse({ status: 200, type: SendBackupNowResponseDto })
  async sendNow(): Promise<SendBackupNowResponseDto> {
    const settings = await this.settingsService.get();
    const botToken = settings.botToken?.trim() ?? '';
    const chatIds = settings.chatIds.filter((id) => id.trim().length > 0);

    if (!botToken) {
      throw new BadRequestException(
        'Save a Telegram bot token before sending a backup',
      );
    }
    if (chatIds.length === 0) {
      throw new BadRequestException(
        'Save at least one Telegram chat ID before sending a backup',
      );
    }

    let zipPath: string | undefined;
    try {
      const backup = await this.backupService.createBackup();
      zipPath = backup.zipPath;

      const failed: string[] = [];
      let sent = 0;

      for (const chatId of chatIds) {
        try {
          await this.backupService.sendTelegramDocument(
            botToken,
            chatId,
            backup.zipPath,
            backup.fileName,
          );
          sent += 1;
        } catch {
          failed.push(chatId);
        }
      }

      if (sent === 0) {
        throw new BadRequestException(
          'Backup created but Telegram delivery failed for all chat IDs',
        );
      }

      return {
        ok: true,
        sent,
        failed,
        message:
          failed.length > 0
            ? `Sent to ${sent} chat(s); failed: ${failed.join(', ')}`
            : `Sent backup to ${sent} chat(s)`,
      };
    } finally {
      if (zipPath) {
        await this.backupService.cleanupBackupArtifact(zipPath);
      }
    }
  }

  @Post('send-report-now')
  @Roles(UserRole.MANAGER)
  @ApiOperation({
    summary:
      'Generate and send a daily/weekly/monthly activity PDF report to Telegram',
  })
  @ApiResponse({ status: 200, type: SendReportNowResponseDto })
  async sendReportNow(
    @Body() dto: SendReportNowDto,
  ): Promise<SendReportNowResponseDto> {
    const settings = await this.settingsService.get();
    const botToken = settings.botToken?.trim() ?? '';
    const chatIds = settings.chatIds.filter((id) => id.trim().length > 0);

    if (!botToken) {
      throw new BadRequestException(
        'Save a Telegram bot token before sending a report',
      );
    }
    if (chatIds.length === 0) {
      throw new BadRequestException(
        'Save at least one Telegram chat ID before sending a report',
      );
    }

    const result = await this.reportService.sendReport(
      dto.kind,
      botToken,
      chatIds,
      new Date(),
      'partial',
    );

    if (result.sent === 0) {
      throw new BadRequestException(
        'Report created but Telegram delivery failed for all chat IDs',
      );
    }

    return {
      ok: true,
      sent: result.sent,
      failed: result.failed,
      fileName: result.fileName,
      message:
        result.failed.length > 0
          ? `Sent ${dto.kind} report to ${result.sent} chat(s); failed: ${result.failed.join(', ')}`
          : `Sent ${dto.kind} report to ${result.sent} chat(s)`,
    };
  }

  @Post('restore')
  @Roles(UserRole.MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'confirm'],
      properties: {
        file: { type: 'string', format: 'binary' },
        confirm: { type: 'boolean', example: true },
      },
    },
  })
  @ApiOperation({
    summary:
      'Restore database from a backup zip (manager only; requires confirm=true)',
  })
  @ApiResponse({ status: 200, type: RestoreBackupResponseDto })
  async restore(
    @UploadedFile()
    file:
      | {
          buffer: Buffer;
          mimetype: string;
          originalname: string;
          size: number;
        }
      | undefined,
    @Body() dto: RestoreBackupDto,
  ): Promise<RestoreBackupResponseDto> {
    if (!dto.confirm) {
      throw new BadRequestException(
        'Restore requires confirm=true because it overwrites database data',
      );
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('Backup zip file is required');
    }

    const name = (file.originalname || '').toLowerCase();
    if (!name.endsWith('.zip') && file.mimetype !== 'application/zip') {
      throw new BadRequestException('Uploaded file must be a .zip backup');
    }

    await this.backupService.restoreFromZip(file.buffer);
    return { ok: true, message: 'Database restored from backup' };
  }
}
