# Credential Manager

A simple web app for storing and organizing passwords/credentials securely.
Built with **NestJS** (backend), **Nuxt 3** (frontend), **PostgreSQL**, and **Prisma ORM**, all written in TypeScript.

## Features

- **Auth**: register, login, JWT-protected API
- **Credential CRUD**: passwords are encrypted at rest (AES-256-GCM) and only decrypted through an explicit "reveal" action
- **Credential Group CRUD**: nested groups (parent/child), automatically rendered as a sidebar menu/submenu
- **Credential Category CRUD**: used to label and filter credentials
- **Soft delete** for all entities
- **Pagination, search, and filter** on every list (credentials can be filtered by group and category)
- **Reusable UI components**: `DataTable`, `AppButton`, `AppInput`, `AppSelect`, `AppModal`
- **Database seeder** with a ready-to-use demo account
- **Docker Compose** setup that runs the whole stack with one command

## Quick Start (Docker)

Requirements: Docker Desktop.

```bash
git clone https://github.com/rafikarim1717/test-fse-logique.git
cd test-fse-logique
cp .env.example .env
```

Fill in `.env` (see [Environment Variables](#environment-variables)). Generate the two secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then run:

```bash
docker compose up --build
```

On startup the backend automatically runs migrations and the seeder.

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |
| Adminer  | http://localhost:8080 |

**Demo account**

- Email: `demo@example.com`
- Password: `password123`

## Running Locally (without Docker for the apps)

Requirements: Node.js 22+, Docker (for PostgreSQL).

**1. Start the database** (from the project root):

```bash
docker compose up -d db adminer
```

**2. Backend:**

```bash
cd backend
cp .env.example .env   # fill in the values, DATABASE_URL host = localhost
npm install --legacy-peer-deps
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**3. Frontend** (in another terminal):

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

> `--legacy-peer-deps` is needed because of a peer dependency conflict in the current Prisma release.

## Environment Variables

Root `.env` (used by Docker Compose):

| Variable            | Description                                         |
| ------------------- | --------------------------------------------------- |
| `POSTGRES_USER`     | Database user                                       |
| `POSTGRES_PASSWORD` | Database password                                   |
| `POSTGRES_DB`       | Database name                                       |
| `JWT_SECRET`        | Secret for signing JWTs (64 hex characters)         |
| `JWT_EXPIRES_IN`    | Token lifetime, e.g. `1d`                           |
| `ENCRYPTION_KEY`    | AES-256 key for credential passwords (64 hex chars) |

`backend/.env` (local development) uses the same values plus `DATABASE_URL`.

Secrets are never committed: `.env` files are git-ignored and excluded from Docker images. Only `.env.example` files are in the repository.

## API Overview

All endpoints except `/auth/*` require `Authorization: Bearer <token>`.

| Method | Endpoint                  | Description                               |
| ------ | ------------------------- | ----------------------------------------- |
| POST   | `/auth/register`          | Register a new user                       |
| POST   | `/auth/login`             | Log in, returns `accessToken`             |
| GET    | `/categories`             | List (`page`, `limit`, `search`)          |
| POST   | `/categories`             | Create                                    |
| GET    | `/categories/:id`         | Detail                                    |
| PATCH  | `/categories/:id`         | Update                                    |
| DELETE | `/categories/:id`         | Soft delete                               |
| GET    | `/groups`                 | List (`page`, `limit`, `search`)          |
| GET    | `/groups/tree`            | Nested group tree for the sidebar         |
| POST / PATCH / DELETE | `/groups/...` | Same pattern as categories             |
| GET    | `/credentials`            | List (`page`, `limit`, `search`, `groupId`, `categoryId`) |
| GET    | `/credentials/:id`        | Detail (password excluded)                |
| GET    | `/credentials/:id/reveal` | Returns the decrypted password            |
| POST / PATCH / DELETE | `/credentials/...` | Same pattern as categories        |

List responses share one shape:

```json
{ "data": [], "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 } }
```

## Architecture

### Backend: layered architecture

```
Controller  →  Service  →  Repository  →  Prisma
(HTTP)         (business     (database
               logic)        queries)
```

```
backend/src/
├── auth/           # register, login, global JWT guard, @Public, @CurrentUser
├── users/          # users repository
├── categories/     # controller, service, repository, dto
├── groups/         # + tree building and cycle prevention
├── credentials/    # + encryption and reveal
├── encryption/     # AES-256-GCM service (global module)
├── prisma/         # PrismaService (global module)
└── common/dto/     # shared pagination query and response helper
```

### Frontend

```
frontend/
├── components/     # reusable UI: DataTable, AppButton, AppInput, AppSelect, AppModal, GroupMenu
├── composables/    # useAuth (token), useApi (fetch wrapper with auth header)
├── layouts/        # sidebar layout with dynamic group menu
├── middleware/     # global route guard
├── pages/          # login, credentials, groups, categories
└── types/          # shared TypeScript types
```

## Design Decisions

- **Groups vs categories.** Groups are the navigation structure (folders shown in the sidebar, can be nested). Categories are flat labels used for filtering (e.g. Email, Banking, Server). Every credential belongs to one group and one category.
- **Encryption.** Credential passwords use AES-256-GCM with a random IV per encryption. The IV and auth tag are stored together with the ciphertext (`iv:authTag:ciphertext`); only the key lives in the environment. The auth tag also detects tampering.
- **Password exposure.** List and detail responses never include the password, not even the encrypted value. It is only returned by `GET /credentials/:id/reveal`.
- **User passwords** are hashed with bcrypt (one-way), unlike credential passwords, which must be decryptable.
- **Separate secrets.** `JWT_SECRET` and `ENCRYPTION_KEY` are independent, so leaking one does not compromise the other.
- **Ownership.** Every query is scoped to the authenticated user's ID. Accessing another user's data returns 404.
- **Soft delete.** Deleting sets `deletedAt`; all read queries filter on `deletedAt: null`.
- **Deleting a group with sub-groups is blocked** (409) to avoid orphaned menu items. Moving a group under its own descendant is also rejected to prevent cycles.
- **Frontend runs as an SPA** (`ssr: false`). The token is stored in a cookie and attached by `useApi`; a 401 response logs the user out. In Docker, the static build is served by Nginx.
- **IDs** are auto-increment integers. Ownership checks on every query prevent ID guessing from exposing other users' data.

## Deployment Notes

The app is container-ready. To deploy:

1. Provision a PostgreSQL database and set the environment variables above.
2. Build and run the backend image; it applies migrations on start.
3. Build the frontend image with `--build-arg NUXT_PUBLIC_API_BASE=<your backend URL>` and serve it.