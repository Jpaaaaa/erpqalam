import { BadRequestException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

export interface UploadedPdfFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export async function assertValidLetterheadPdf(file: UploadedPdfFile): Promise<void> {
  if (!file.buffer?.length) {
    throw new BadRequestException('PDF file is required');
  }

  if (file.mimetype !== 'application/pdf') {
    throw new BadRequestException('Only PDF files are allowed');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new BadRequestException('PDF file must be 10 MB or smaller');
  }

  try {
    const pdf = await PDFDocument.load(file.buffer);
    if (pdf.getPageCount() < 1) {
      throw new BadRequestException('PDF must contain at least one page');
    }
  } catch {
    throw new BadRequestException('Invalid PDF file');
  }
}
