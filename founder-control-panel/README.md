# Founder Control Panel

Founder Control Panel is a calm operating system for founders to capture ideas, evaluate them with trust cues, generate monetizable blueprints, and prepare marketplace listings.

## What this repo includes
- `apps/api`: Express + Prisma API (auth, idea workflows, AI orchestration, provenance logs)
- `apps/web`: Next.js private-beta UI
- `apps/worker`: background worker scaffold
- `packages/*`: shared prompts, config, utilities, and types
- `prisma/*`: schema, migration, and demo seed SQL

## Prerequisites
- Node 20+
- Docker + Docker Compose
- `psql` CLI (for demo seed convenience command)

## Setup (private beta)
1. Copy env and configure:
   ```bash
   cp .env.example .env
   ```
2. Ensure required values are valid (API validates these at startup):
   - `DATABASE_URL`
   - `JWT_SECRET` (minimum 32 chars)
   - `OPENAI_API_KEY` unless `AI_USE_MOCK=true`
3. Start services:
   ```bash
   docker compose up --build
   ```
4. App endpoints:
   - API: `http://localhost:5001`
   - Web: `http://localhost:3001`

## Demo-ready seed path
After database is running and migrated:

```bash
npm run seed:demo
```

Seeded demo credentials:
- Email: `demo@foundercontrolpanel.dev`
- Password: `demo12345`

This creates a mission, sample ideas, one blueprint, and one listing to evaluate the full listing/blueprint journey quickly.

## Development commands
- Typecheck shared packages: `npm run typecheck`
- API tests: `npm run test`
- Combined check: `npm run build`

## Security and reliability baseline
- bcrypt password hashing
- JWT auth with issuer/audience checks
- centralized validation and error envelope (`code`, `requestId`)
- rate limiting
- structured JSON logs
- AI prompt version + model provenance logging
