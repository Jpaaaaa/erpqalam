import {
  Controller,
  Get,
  Header,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { buildHandshakeConfig } from './iclock.parser';
import { IclockService } from './iclock.service';

function readRawBody(req: Request): string {
  if (typeof req.body === 'string') {
    return req.body;
  }
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (rawBody instanceof Buffer) {
    return rawBody.toString('utf8');
  }
  if (req.body && typeof req.body === 'object' && Buffer.isBuffer(req.body)) {
    return req.body.toString('utf8');
  }
  return '';
}

@Controller('iclock')
export class IclockController {
  private readonly logger = new Logger(IclockController.name);

  constructor(private readonly iclockService: IclockService) {}

  private logRequest(req: Request, rawBody: string): void {
    this.logger.debug(
      `iclock ${req.method} ${req.originalUrl} query=${JSON.stringify(req.query)} body=${JSON.stringify(rawBody)}`,
    );
  }

  private sendPlainText(res: Response, body: string, status = 200): void {
    res.status(status).type('text/plain').send(body);
  }

  @Get('cdata')
  @Header('Content-Type', 'text/plain')
  async handshake(
    @Query('SN') serialNumber: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logRequest(req, '');
    await this.iclockService.touchDevice(serialNumber ?? '');
    const sn = serialNumber?.trim() || 'UNKNOWN';
    this.sendPlainText(res, buildHandshakeConfig(sn));
  }

  @Post('cdata')
  @Header('Content-Type', 'text/plain')
  async upload(
    @Query('SN') serialNumber: string,
    @Query('table') table: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const rawBody = readRawBody(req);
    this.logRequest(req, rawBody);

    const tableName = (table ?? '').trim().toUpperCase();
    const sn = serialNumber ?? '';

    if (tableName === 'ATTLOG') {
      await this.iclockService.ingestAttlog(sn, rawBody);
    } else if (tableName === 'OPERLOG') {
      await this.iclockService.ingestOperlog(sn, rawBody);
    } else if (tableName === 'USER' || tableName === 'USERINFO') {
      await this.iclockService.ingestUserData(sn, rawBody);
    } else {
      await this.iclockService.touchDevice(sn);
      if (tableName) {
        this.logger.debug(`Unhandled iclock table=${tableName} from SN=${sn}`);
      }
    }

    this.sendPlainText(res, 'OK');
  }

  @Get('getrequest')
  @Header('Content-Type', 'text/plain')
  async getRequest(
    @Query('SN') serialNumber: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logRequest(req, '');
    await this.iclockService.touchDevice(serialNumber ?? '');
    this.sendPlainText(res, 'OK');
  }

  @Get('ping')
  @Header('Content-Type', 'text/plain')
  async ping(
    @Query('SN') serialNumber: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logRequest(req, '');
    await this.iclockService.touchDevice(serialNumber ?? '');
    this.sendPlainText(res, 'OK');
  }

  @Get('devicecmd')
  @Header('Content-Type', 'text/plain')
  async deviceCmdGet(
    @Query('SN') serialNumber: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logRequest(req, '');
    await this.iclockService.touchDevice(serialNumber ?? '');
    this.sendPlainText(res, 'OK');
  }

  @Post('devicecmd')
  @Header('Content-Type', 'text/plain')
  async deviceCmdPost(
    @Query('SN') serialNumber: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const rawBody = readRawBody(req);
    this.logRequest(req, rawBody);
    await this.iclockService.touchDevice(serialNumber ?? '');
    this.sendPlainText(res, 'OK');
  }
}
