import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { type Browser } from 'puppeteer-core';

const IDLE_CLOSE_MS = 5 * 60 * 1000;
const PDF_RENDER_TIMEOUT_MS = 180_000;

@Injectable()
export class AttendancePdfChromiumService implements OnModuleDestroy {
  private readonly logger = new Logger(AttendancePdfChromiumService.name);
  private browser: Browser | null = null;
  private launchPromise: Promise<Browser> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly config: ConfigService) {}

  async renderPdf(html: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    this.scheduleIdleClose();
    const page = await browser.newPage();
    try {
      page.setDefaultNavigationTimeout(PDF_RENDER_TIMEOUT_MS);
      page.setDefaultTimeout(PDF_RENDER_TIMEOUT_MS);
      await page.setContent(html, {
        waitUntil: 'load',
        timeout: PDF_RENDER_TIMEOUT_MS,
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.4in',
          right: '0.4in',
          bottom: '0.4in',
          left: '0.4in',
        },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.clearIdleTimer();
    await this.closeBrowser();
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) {
      return this.browser;
    }
    if (!this.launchPromise) {
      this.launchPromise = this.launchBrowser();
    }
    try {
      this.browser = await this.launchPromise;
      return this.browser;
    } finally {
      this.launchPromise = null;
    }
  }

  private async launchBrowser(): Promise<Browser> {
    const executablePath =
      this.config.get<string>('CHROMIUM_PATH') ?? '/usr/bin/chromium';
    this.logger.log(`Launching Chromium for PDF: ${executablePath}`);
    return puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }

  private scheduleIdleClose(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      void this.closeBrowser();
    }, IDLE_CLOSE_MS);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private async closeBrowser(): Promise<void> {
    const browser = this.browser;
    this.browser = null;
    if (browser) {
      await browser.close().catch(() => undefined);
      this.logger.log('Chromium PDF browser closed (idle timeout or shutdown)');
    }
  }
}
