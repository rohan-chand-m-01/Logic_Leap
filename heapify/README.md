# Heapify - Campus Digital Ecosystem

Heapify is a full-stack campus platform with student, teacher, and admin portals, AI tutor workflows, analytics, attendance, tests, chat, risk engine, and timetable generation.

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 15+
- Redis 7+ (or Upstash Redis URL)
- Qdrant (Docker/local or Qdrant Cloud)

## Setup

1. Clone repository and install dependencies:

```bash
npm install
```

2. Copy env templates:

- Root: copy `.env.example` to `.env`
- Frontend: copy `apps/web/.env.example` to `apps/web/.env`

3. Fill keys/URLs in `.env`:

- Groq: [console.groq.com](https://console.groq.com)
- Cloudinary: [cloudinary.com](https://cloudinary.com)
- Upstash Redis: [upstash.com](https://upstash.com)

4. Start local infra (optional with Docker):

```bash
docker compose up -d
```

5. Run DB migration:

```bash
npm run migrate --workspace=apps/server
```

6. Start full app:

```bash
npm run dev
```

## Scripts

- Root dev: `npm run dev`
- Root build: `npm run build`
- Server migrate: `npm run migrate --workspace=apps/server`

## Notes

- In development, migrations run on server startup.
- In production, run migration manually/CI before deploy.
- Frontend expects API under `VITE_API_URL`.
