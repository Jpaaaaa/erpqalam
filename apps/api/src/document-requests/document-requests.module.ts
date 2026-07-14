import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { DocumentRequestsController } from './document-requests.controller';
import { DocumentRequestsService } from './document-requests.service';
import { DocumentRequestTemplateStorage } from './document-request-template.storage';

@Module({
  controllers: [DocumentRequestsController],
  providers: [
    DocumentRequestsService,
    DocumentRequestTemplateStorage,
    RolesGuard,
  ],
})
export class DocumentRequestsModule {}
