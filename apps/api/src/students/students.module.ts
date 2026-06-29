import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PendingStudentsService } from './pending-students.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, PendingStudentsService],
  exports: [StudentsService, PendingStudentsService],
})
export class StudentsModule {}
