# ERP Qalam — School ERP

Registration module (v1): NestJS API with Manager and Employee roles, JWT auth, and user CRUD.

## Stack

- **API:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma
- **Containers:** Docker (Postgres + API)
- **Redis:** skipped for now — architecture ready to plug in later

## Project structure

```
erpqalam/
├── apps/
│   ├── api/                # NestJS backend
│   │   ├── prisma/         # Schema, migrations, seed
│   │   └── src/
│   │       ├── auth/       # Register, login, JWT, refresh tokens
│   │       ├── users/      # User CRUD + approval
│   │       ├── students/   # Student check-in + pending/register
│   │       ├── common/     # Guards, decorators, cache stub
│   │       ├── config/     # Env configuration
│   │       ├── database/   # Prisma module
│   │       └── health/     # Health check
│   └── web/                # Next.js frontend
│       ├── app/            # App Router pages
│       ├── components/     # UI, auth, layout
│       └── lib/            # API client, auth, types
├── packages/
│   └── shared/             # Shared types/DTOs (placeholder)
└── docker/
    └── docker-compose.dev.yml
```

## Quick start

### 1. Install dependencies

```bash
npm install
npm run install:all
```

Copy env files if you haven't already:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 2. Start Postgres

**Easiest:** just run `npm run dev` — it picks the database automatically:

1. **Docker Postgres** if Docker Desktop is running (stable, fixed port)
2. **Prisma Dev** fallback if Docker is unavailable

Optional manual start:

```bash
npm run db:start   # Docker only; warns if Docker is off
```

`predev` verifies the connection, sets `DATABASE_URL` in `apps/api/.env`, and runs migrations + seed.

To force Prisma Dev only, set `USE_PRISMA_DEV=1` in `apps/api/.env`.

### 3. Database setup (first time)

Migrations and seed run automatically on `npm run dev`. To run manually:

```bash
npm run db:migrate
npm run db:seed
```

### 4. Run backend + frontend (one command)

From the project root:

```bash
npm run dev
```

`predev` automatically:
1. Frees ports **3000** and **3001**
2. Starts **Docker Postgres** or falls back to **Prisma Dev**, then verifies the connection
3. Runs migrations + seed

Then both servers start.

| Service | URL |
|---------|-----|
| API | http://localhost:3000/api/v1 |
| Web | http://localhost:3001/en/login |
| Swagger | http://localhost:3000/api/docs |

Run individually if needed:

```bash
npm run kill-ports  # free ports 3000 & 3001 only
npm run dev:api     # backend only
npm run dev:web     # frontend only
```

### Alternative: Docker API + local web

```bash
docker compose -f docker/docker-compose.dev.yml up --build
```

API: http://localhost:3000/api/v1  
Web: http://localhost:3001  
Swagger: http://localhost:3000/api/docs

## Seed credentials

| Field | Value |
|-------|-------|
| School code | `QALAM001` |
| Manager email | `manager@qalam.dev` |
| Password | `Manager123!` |

## API endpoints

### Auth (public)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/auth/register-school` | Create school + first manager |
| POST | `/api/v1/auth/register` | Employee self-register (pending) |
| POST | `/api/v1/auth/login` | Login → access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Rotate tokens |
| POST | `/api/v1/auth/logout` | Revoke refresh token |

### Users (Bearer token)

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/v1/users` | Manager | Create user |
| GET | `/api/v1/users` | Manager | List users (paginated) |
| GET | `/api/v1/users/:id` | Manager / self | Get user |
| PATCH | `/api/v1/users/:id` | Manager / self | Update user |
| PATCH | `/api/v1/users/:id/approve` | Manager | Approve pending employee |
| DELETE | `/api/v1/users/:id` | Manager | Deactivate user |

### Students

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/v1/students/pending` | Public | Student submits name (pending) |
| POST | `/api/v1/students/pending/full` | Manager | Add pending student with full details |
| GET | `/api/v1/students?status=PENDING` | Manager | List students (filter by status) |
| PATCH | `/api/v1/students/:id/register` | Manager | Move pending → registered |

**Web:** check-in `/{locale}/student-check-in` · registration module `/{locale}/dashboard/registration/students` (pending + registered subtabs) · HR module `/{locale}/dashboard/hr`

### Health

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/health` | Postgres + cache status |

## Registration flow

1. **Bootstrap:** `POST /auth/register-school` or use seed data.
2. **Employee signup:** `POST /auth/register` with `schoolCode` → status `PENDING`.
3. **Manager approves:** `PATCH /users/:id/approve` → status `ACTIVE`.
4. **Login:** only `ACTIVE` users can authenticate.

## Adding Redis later

1. Uncomment `redis` service in `docker/docker-compose.dev.yml`.
2. Set `REDIS_URL` and `CACHE_STORE=redis` in `.env`.
3. Implement `RedisRefreshTokenStore` and register it in `auth.module.ts`.
4. Health check will report Redis as `configured`.

## Student registration flow

1. **Check-in:** Student opens `/{locale}/student-check-in`, enters first/second name + school code → `PENDING`.
2. **Review:** Manager opens pending list, clicks **Register** → `REGISTERED`.
3. **Pending form:** Manager uses **Pending** tab (3 names, 2 mobiles, come via who) → `PENDING`.
4. **Approve:** Manager clicks **Register** on pending row → `REGISTERED` (registered by auto-set).

## Future modules

Teachers, Parents, Classes, Grades, Attendance, Fees, Timetable — each as a NestJS domain module under `src/`.
