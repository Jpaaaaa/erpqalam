import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { DocumentRequestsController } from './document-requests.controller';
import { DocumentRequestsService } from './document-requests.service';

@Module({
  controllers: [DocumentRequestsController],
  providers: [DocumentRequestsService, RolesGuard],
})
export class DocumentRequestsModule {}
