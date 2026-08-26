import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZipArchive } from 'archiver';
import AdmZip = require('adm-zip');
import { createWriteStream, existsSync, promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'child_process';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private readonly config: ConfigService) {}

  private getDatabaseUrl(): string {
    const url =
      this.config.get<string>('database.url') ?? process.env.DATABASE_URL;
    if (!url) {
      throw new InternalServerErrorException('DATABASE_URL is not configured');
    }
    return url;
  }

  private resolveEnvPath(): string {
    const candidates = [
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), 'apps', 'api', '.env'),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) return candidate;
    }
    throw new InternalServerErrorException('.env file not found');
  }

  private async runCommand(
    command: string,
    args: string[],
    env?: NodeJS.ProcessEnv,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, {
        env: { ...process.env, ...env },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stderr = '';
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on('error', (err) => reject(err));
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        reject(
          new Error(
            `${command} exited with code ${code}: ${stderr.trim() || 'no stderr'}`,
          ),
        );
      });
    });
  }

  /**
   * Dump the database, zip `.env` + dump, return absolute zip path.
   * Caller is responsible for deleting the zip when done.
   */
  async createBackup(): Promise<{ zipPath: string; fileName: string }> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'erpqalam-backup-'));
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sqlPath = path.join(tmpDir, `erpqalam-${stamp}.sql`);
    const fileName = `erpqalam-backup-${stamp}.zip`;
    const zipPath = path.join(tmpDir, fileName);

    try {
      const databaseUrl = this.getDatabaseUrl();
      await this.runCommand('pg_dump', [
        '--dbname',
        databaseUrl,
        '--no-owner',
        '--no-acl',
        '--clean',
        '--if-exists',
        '--format=plain',
        '--file',
        sqlPath,
      ]);

      const envPath = this.resolveEnvPath();
      await this.zipFiles(zipPath, [
        { source: envPath, name: '.env' },
        { source: sqlPath, name: path.basename(sqlPath) },
      ]);

      return { zipPath, fileName };
    } catch (err) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
      this.logger.error(
        `Backup failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Backup failed',
      );
    } finally {
      await fs.unlink(sqlPath).catch(() => undefined);
    }
  }

  private async zipFiles(
    zipPath: string,
    files: Array<{ source: string; name: string }>,
  ): Promise<void> {
    const output = createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    const done = new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      output.on('error', reject);
      archive.on('error', reject);
    });

    archive.pipe(output);
    for (const file of files) {
      archive.file(file.source, { name: file.name });
    }
    await archive.finalize();
    await done;
  }

  async restoreFromZip(zipBuffer: Buffer): Promise<void> {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'erpqalam-restore-'),
    );

    try {
      const zip = new AdmZip(zipBuffer);
      const entries = zip.getEntries().filter((e) => !e.isDirectory);
      const sqlEntry = entries.find((e) =>
        e.entryName.toLowerCase().endsWith('.sql'),
      );

      if (!sqlEntry) {
        throw new BadRequestException(
          'Backup zip must contain a .sql dump file',
        );
      }

      const sqlPath = path.join(tmpDir, path.basename(sqlEntry.entryName));
      await fs.writeFile(sqlPath, sqlEntry.getData());

      const databaseUrl = this.getDatabaseUrl();
      await this.runCommand('psql', [
        '--dbname',
        databaseUrl,
        '--set',
        'ON_ERROR_STOP=1',
        '--file',
        sqlPath,
      ]);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(
        `Restore failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Restore failed',
      );
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  async sendTelegramDocument(
    botToken: string,
    chatId: string,
    filePath: string,
    fileName: string,
    options?: { caption?: string; contentType?: string },
  ): Promise<void> {
    const fileBuffer = await fs.readFile(filePath);
    await this.sendTelegramDocumentBuffer(
      botToken,
      chatId,
      fileBuffer,
      fileName,
      options,
    );
  }

  async sendTelegramDocumentBuffer(
    botToken: string,
    chatId: string,
    fileBuffer: Buffer,
    fileName: string,
    options?: { caption?: string; contentType?: string },
  ): Promise<void> {
    const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
    const blob = new Blob([Uint8Array.from(fileBuffer)], {
      type: options?.contentType ?? 'application/octet-stream',
    });
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('document', blob, fileName);
    form.append(
      'caption',
      options?.caption ?? `ERP Qalam ${new Date().toISOString()}`,
    );

    const response = await fetch(url, { method: 'POST', body: form });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Telegram sendDocument failed for chat ${chatId}: ${response.status} ${body}`,
      );
    }
  }

  async cleanupBackupArtifact(zipPath: string): Promise<void> {
    const dir = path.dirname(zipPath);
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }

  /**
   * Discover chat IDs from recent Telegram updates after users message the bot.
   */
  async detectTelegramChats(botToken: string): Promise<
    Array<{ chatId: string; type?: string; title?: string }>
  > {
    const token = botToken.trim();
    if (!token) {
      throw new BadRequestException('Telegram bot token is required');
    }

    const url = `https://api.telegram.org/bot${token}/getUpdates?limit=100`;
    let response: Response;
    try {
      response = await fetch(url);
    } catch (err) {
      this.logger.error(
        `Telegram getUpdates network error: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      throw new InternalServerErrorException(
        'Unable to reach Telegram API',
      );
    }

    const body = (await response.json()) as {
      ok?: boolean;
      description?: string;
      result?: Array<{
        message?: {
          chat?: {
            id?: number | string;
            type?: string;
            title?: string;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        channel_post?: {
          chat?: {
            id?: number | string;
            type?: string;
            title?: string;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        my_chat_member?: {
          chat?: {
            id?: number | string;
            type?: string;
            title?: string;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      }>;
    };

    if (!response.ok || !body.ok) {
      throw new BadRequestException(
        body.description ??
          'Telegram getUpdates failed. Check the bot token and that no webhook is set.',
      );
    }

    const byId = new Map<
      string,
      { chatId: string; type?: string; title?: string }
    >();

    for (const update of body.result ?? []) {
      const chat =
        update.message?.chat ??
        update.channel_post?.chat ??
        update.my_chat_member?.chat;
      if (chat?.id === undefined || chat.id === null) continue;

      const chatId = String(chat.id);
      if (byId.has(chatId)) continue;

      const nameFromUser = [chat.first_name, chat.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      const title =
        chat.title || nameFromUser || chat.username || undefined;

      byId.set(chatId, {
        chatId,
        type: chat.type,
        title: title || undefined,
      });
    }

    return [...byId.values()];
  }
}
