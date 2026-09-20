import { ApiProperty } from '@nestjs/swagger';

export class StudentAuditChangeDto {
  @ApiProperty({ example: 'firstName' })
  field: string;

  @ApiProperty({ required: false, nullable: true, example: 'Ahmad' })
  old: string | null;

  @ApiProperty({ required: false, nullable: true, example: 'Ahmed' })
  new: string | null;
}

export class StudentAuditLogEntryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['CREATE', 'UPDATE'] })
  action: string;

  @ApiProperty({ example: 'Sara Mohammed' })
  changedByName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [StudentAuditChangeDto] })
  changes: StudentAuditChangeDto[];
}
