import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';
import { createE2eApp } from './helpers/e2e-app.helper';
import { cleanupSchool } from './helpers/db.helper';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const runId = Date.now().toString(36);
  const schoolCode = `USERS-${runId}`;
  const managerEmail = `mgr-${runId}@e2e.test`;
  const employeeEmail = `emp-${runId}@e2e.test`;
  const pendingEmail = `pending-${runId}@e2e.test`;
  const password = 'TestPass123!';

  let schoolId: string;
  let managerToken: string;
  let createdUserId: string;
  let pendingUserId: string;
  let employeeToken: string;

  beforeAll(async () => {
    app = await createE2eApp();
    prisma = app.get(PrismaService);

    const bootstrap = await request(app.getHttpServer())
      .post('/api/v1/auth/register-school')
      .send({
        schoolName: 'E2E Users School',
        schoolCode,
        email: managerEmail,
        password,
        firstName: 'Users',
        lastName: 'Manager',
      })
      .expect(201);

    schoolId = bootstrap.body.user.schoolId;
    managerToken = bootstrap.body.tokens.accessToken;

    const pending = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: pendingEmail,
        password,
        firstName: 'Pending',
        lastName: 'Employee',
        schoolCode,
      })
      .expect(201);

    pendingUserId = pending.body.id;
  });

  afterAll(async () => {
    if (schoolId) {
      await cleanupSchool(prisma, schoolId);
    }
    await app.close();
  });

  describe('POST /api/v1/users', () => {
    it('manager creates an active employee', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          email: employeeEmail,
          password,
          firstName: 'Created',
          lastName: 'Employee',
          role: 'EMPLOYEE',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        email: employeeEmail,
        firstName: 'Created',
        lastName: 'Employee',
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        schoolId,
      });

      createdUserId = res.body.id;
    });

    it('rejects unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: `noauth-${runId}@e2e.test`,
          password,
          firstName: 'No',
          lastName: 'Auth',
          role: 'EMPLOYEE',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/users', () => {
    it('manager lists users with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
      expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('filters by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users?status=PENDING')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.data.every((u: { status: string }) => u.status === 'PENDING')).toBe(true);
      expect(res.body.data.some((u: { id: string }) => u.id === pendingUserId)).toBe(true);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('manager gets user by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdUserId);
      expect(res.body.email).toBe(employeeEmail);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('manager updates user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ firstName: 'Updated', phone: '+1234567890' })
        .expect(200);

      expect(res.body.firstName).toBe('Updated');
      expect(res.body.phone).toBe('+1234567890');
    });
  });

  describe('PATCH /api/v1/users/:id/approve', () => {
    it('manager approves pending employee', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/users/${pendingUserId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.id).toBe(pendingUserId);
      expect(res.body.status).toBe('ACTIVE');
    });

    it('approved employee can login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: pendingEmail, password })
        .expect(200);

      expect(res.body.user.status).toBe('ACTIVE');
      employeeToken = res.body.tokens.accessToken;
    });

    it('employee can get own profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users/${pendingUserId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(res.body.id).toBe(pendingUserId);
    });

    it('employee cannot list all users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('manager deactivates user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdUserId);
      expect(res.body.status).toBe('INACTIVE');
    });

    it('deactivated user cannot login', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: employeeEmail, password })
        .expect(403);
    });

    it('manager cannot deactivate self', async () => {
      const manager = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      const managerUser = manager.body.data.find(
        (u: { email: string }) => u.email === managerEmail,
      );

      await request(app.getHttpServer())
        .delete(`/api/v1/users/${managerUser.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });
  });
});
