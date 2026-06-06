# Tenadam Wellness API

Express + Prisma API for the hackathon Wellness Intelligence Platform.

## Setup

1. Create a Neon Postgres database.
2. Copy `backend/.env.example` to `backend/.env`.
3. Paste your Neon pooled connection string into `DATABASE_URL`.
4. Optional but recommended: add `XAI_API_KEY` to enable real Grok-generated wellness coaching.
5. From the repo root, install dependencies and push the schema:

```bash
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev:api
```

The API runs on `http://localhost:4000`.

## Main Endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /intake/wellness-profile`
- `GET /intake/dashboard`
- `POST /users`
- `POST /assessments`
- `GET /assessments/user/:userId`
- `POST /fitness/plans`
- `POST /social/profiles`
- `POST /goals`
- `GET /marketplace/offers?city=Addis%20Ababa`
- `POST /marketplace/recommend/:assessmentId`
- `POST /marketplace/leads`
- `POST /passport/activities`
- `GET /passport/users/:userId`

## Demo Flow

Create a user, submit a wellness assessment, generate marketplace recommendations from that assessment, then create a provider lead. Add passport activities to show the sponsor reward loop.

## AI Coach

The intake endpoint uses xAI/Grok when `XAI_API_KEY` is set. It sends the latest profile plus saved wellness history to the model and stores the returned routines, meals, social recommendations, and growth milestones. If the key is missing or the model call fails, the local rule engine generates a safe fallback plan.
