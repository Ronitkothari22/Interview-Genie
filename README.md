# Interview Genie 🧞‍♂️

An AI-powered interview preparation platform. The project is split into two
independent applications:

| Project | Stack | Responsibility |
|---|---|---|
| [`backend/`](./backend) | TypeScript + Node.js + Express | REST API, Prisma/PostgreSQL, auth (JWT cookies), PDF generation, email, Gemini AI |
| [`frontend/`](./frontend) | Next.js 14 (App Router) | Pure UI. Talks to the backend over REST |

The two projects are **plain sibling folders**, each with its own
`package.json` — there is no workspace tooling. A small set of shared code
(zod validations + resume/session types) is duplicated into
`backend/src/shared/` and `frontend/src/lib/shared/` and kept in sync manually.

## Features 🌟

- AI-powered mock interviews
- Resume analysis and optimization
- Resume builder with PDF export
- Interview/progress statistics
- Document preparation tools

## Architecture 🔀

```
Browser ──HTTP/cookies──► frontend (Next.js :3000) ──REST──► backend (Express :4000) ──► PostgreSQL
```

- Auth is owned entirely by the backend (signup, login, Google OAuth, OTP,
  password reset). The session is an httpOnly JWT cookie.
- In development, cookies are shared between `localhost:3000` and
  `localhost:4000` (cookies ignore ports). In production, set `COOKIE_DOMAIN`.
- The frontend calls the API via `NEXT_PUBLIC_API_URL` with
  `credentials: "include"`.

## Prerequisites 📋

- Node.js 18+
- PostgreSQL
- (optional) Google OAuth + Gemini API credentials, SMTP credentials

## Getting Started 🚀

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in DATABASE_URL, AUTH_SECRET, etc.
npm run db:migrate        # apply Prisma migrations
npm run dev               # http://localhost:4000
```

Health check: `GET http://localhost:4000/api/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev               # http://localhost:3000
```

Run the backend first (or alongside) so the UI can reach the API.

## Environment Variables 🔑

### `backend/.env`

See [`backend/.env.example`](./backend/.env.example) for the full list.
Key variables: `PORT`, `DATABASE_URL`, `AUTH_SECRET`, `FRONTEND_URL`,
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `GOOGLE_GEMINI_API`,
`EMAIL_USER`/`EMAIL_PASS`, `ATS_API_URL`.

### `frontend/.env`

See [`frontend/.env.example`](./frontend/.env.example).

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend (e.g. `http://localhost:4000`) |

## Available Scripts 📝

### Backend (`backend/`)

```bash
npm run dev         # tsx watch (hot reload)
npm run build       # tsc + tsc-alias → dist/
npm run start       # run built server
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run db:migrate  # prisma migrate deploy
npm run db:studio   # prisma studio
```

### Frontend (`frontend/`)

```bash
npm run dev         # next dev --turbo
npm run build       # next build
npm run start       # next start
npm run lint        # next lint
npm run typecheck   # tsc --noEmit
```

## Documentation 📚

- [Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/api)
- [Component Documentation](./docs/components)

## Deployment 🌐

Deploy `backend/` and `frontend/` separately. Set `FRONTEND_URL` on the
backend to the deployed frontend origin, and `NEXT_PUBLIC_API_URL` on the
frontend to the deployed backend origin. For cross-domain cookies, configure
`COOKIE_DOMAIN`, `secure`, and `sameSite` appropriately.

## Contributing 🤝

1. Create a feature branch from `development`
2. Make changes and test
3. Open a PR to `development`

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
