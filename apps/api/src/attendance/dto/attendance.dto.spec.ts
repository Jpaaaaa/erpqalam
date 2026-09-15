import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ATTENDANCE_RECORDS_MAX_LIMIT,
  ListAttendanceRecordsQueryDto,
} from './attendance.dto';

async function validateLimit(limit: unknown) {
  const dto = plainToInstance(ListAttendanceRecordsQueryDto, { limit });
  return validate(dto);
}

describe('ListAttendanceRecordsQueryDto', () => {
  it('accepts the web per-employee limit', async () => {
    const errors = await validateLimit(ATTENDANCE_RECORDS_MAX_LIMIT);
    expect(errors).toHaveLength(0);
  });

  it('rejects unbounded limits', async () => {
    const errors = await validateLimit(ATTENDANCE_RECORDS_MAX_LIMIT + 1);
    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });

  it('accepts the default list page size', async () => {
    const errors = await validateLimit(500);
    expect(errors).toHaveLength(0);
  });
});
