import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';
import { createE2eApp } from './helpers/e2e-app.helper';
import { cleanupSchool } from './helpers/db.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const runId = Date.now().toString(36);
  const schoolCode = `AUTH-${runId}`;
  const managerEmail = `manager-${runId}@e2e.test`;
  const employeeEmail = `employee-${runId}@e2e.test`;
  const password = 'TestPass123!';

  let schoolId: string;
  let managerTokens: { accessToken: string; refreshToken: string };
  let employeeId: string;

  beforeAll(async () => {
    app = await createE2eApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (schoolId) {
      await cleanupSchool(prisma, schoolId);
    }
    await app.close();
  });

  describe('POST /api/v1/auth/register-school', () => {
    it('creates a school and active manager with tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register-school')
        .send({
          schoolName: 'E2E Auth School',
          schoolCode,
          email: managerEmail,
          password,
          firstName: 'Auth',
          lastName: 'Manager',
        })
        .expect(201);

      expect(res.body.user).toMatchObject({
        email: managerEmail,
        firstName: 'Auth',
        lastName: 'Manager',
        role: 'MANAGER',
        status: 'ACTIVE',
      });
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.schoolId).toBeDefined();
      expect(res.body.tokens.accessToken).toBeDefined();
      expect(res.body.tokens.refreshToken).toBeDefined();

      schoolId = res.body.user.schoolId;
      managerTokens = res.body.tokens;
    });

    it('rejects duplicate school code', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register-school')
        .send({
          schoolName: 'Duplicate School',
          schoolCode,
          email: `other-${runId}@e2e.test`,
          password,
          firstName: 'Other',
          lastName: 'Manager',
        })
        .expect(409);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers an employee with PENDING status', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: employeeEmail,
          password,
          firstName: 'Auth',
          lastName: 'Employee',
          schoolCode,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        email: employeeEmail,
        role: 'EMPLOYEE',
        status: 'PENDING',
        schoolId,
      });
      expect(res.body.tokens).toBeUndefined();

      employeeId = res.body.id;
    });

    it('rejects login for pending employee', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: employeeEmail, password })
        .expect(403);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in active manager', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: managerEmail, password })
        .expect(200);

      expect(res.body.user.email).toBe(managerEmail);
      expect(res.body.user.status).toBe('ACTIVE');
      expect(res.body.tokens.accessToken).toBeDefined();
      expect(res.body.tokens.refreshToken).toBeDefined();

      managerTokens = res.body.tokens;
    });

    it('rejects invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: managerEmail, password: 'WrongPass123!' })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('rotates access and refresh tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: managerTokens.refreshToken })
        .expect(200);

      expect(res.body.user.email).toBe(managerEmail);
      expect(res.body.tokens.accessToken).toBeDefined();
      expect(res.body.tokens.refreshToken).toBeDefined();
      expect(res.body.tokens.refreshToken).not.toBe(
        managerTokens.refreshToken,
      );

      managerTokens = res.body.tokens;
    });

    it('rejects invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken: managerTokens.refreshToken })
        .expect(200);

      expect(res.body.message).toBe('Logged out successfully');
    });

    it('rejects refresh after logout', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: managerTokens.refreshToken })
        .expect(401);
    });
  });
});
