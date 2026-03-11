# ARCHITECTURE

## Monorepo
- apps/web: Next.js App Router UI
- apps/api: Express TypeScript API (routes/controllers/services/middleware)
- apps/worker: background jobs and queue orchestration
- packages/types: shared DTOs and enums
- packages/prompts: centralized prompt templates + versions
- packages/utils: scoring + formatting + logging utilities
- packages/config: environment validation

## API conventions
- `/api/v1/*` routes
- thin controllers
- services for business logic
- centralized error handling

## Worker boundaries
Long-running AI tasks (blueprint generation, compression, 10k detector, PDF) are queued and processed by worker.

## Testing strategy
- service logic tests
- API integration smoke tests
- frontend page smoke tests
