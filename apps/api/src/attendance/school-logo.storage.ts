import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

const LOGO_EXTENSIONS = [
  { ext: '.png', mime: 'image/png' },
  { ext: '.jpg', mime: 'image/jpeg' },
  { ext: '.jpeg', mime: 'image/jpeg' },
  { ext: '.webp', mime: 'image/webp' },
] as const;

export type SchoolLogoFile = {
  base64: string;
  mime: string;
};

@Injectable()
export class SchoolLogoStorage {
  private resolveUploadDir(): string {
    return (
      process.env.SCHOOL_LOGO_UPLOAD_DIR ??
      join(process.cwd(), 'uploads', 'school-logos')
    );
  }

  readIfExists(schoolId: string): SchoolLogoFile | null {
    const dir = this.resolveUploadDir();
    for (const { ext, mime } of LOGO_EXTENSIONS) {
      const path = join(dir, `${schoolId}${ext}`);
      if (existsSync(path)) {
        return {
          base64: readFileSync(path).toString('base64'),
          mime,
        };
      }
    }
    return null;
  }
}
