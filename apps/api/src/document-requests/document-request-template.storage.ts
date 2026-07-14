import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentRequestTemplateStorage {
  private resolveUploadDir(): string {
    return (
      process.env.DOCUMENT_TEMPLATE_UPLOAD_DIR ??
      join(process.cwd(), 'uploads', 'document-templates')
    );
  }

  private resolvePath(schoolId: string): string {
    return join(this.resolveUploadDir(), `${schoolId}.pdf`);
  }

  ensureUploadDir(): void {
    const dir = this.resolveUploadDir();
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  exists(schoolId: string): boolean {
    return existsSync(this.resolvePath(schoolId));
  }

  read(schoolId: string): Buffer | null {
    const path = this.resolvePath(schoolId);
    if (!existsSync(path)) {
      return null;
    }

    return readFileSync(path);
  }

  write(schoolId: string, bytes: Buffer): void {
    this.ensureUploadDir();
    writeFileSync(this.resolvePath(schoolId), bytes);
  }

  delete(schoolId: string): void {
    const path = this.resolvePath(schoolId);
    if (existsSync(path)) {
      unlinkSync(path);
    }
  }
}
