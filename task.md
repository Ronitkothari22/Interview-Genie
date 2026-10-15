# Task: Separate Backend (TypeScript + Node/Express) and Frontend (Next.js)

> Goal: Split the current monolithic Next.js (T3 stack) application into two
> independent projects at the repo root — `backend/` (TypeScript + Node.js +
> Express) and `frontend/` (Next.js) — without breaking any existing feature.
>
> Status: DONE — **Phases 1–14 complete**. The monolith is fully split into
> standalone `backend/` (Express + TS) and `frontend/` (Next.js); the old root
> app has been removed. Only two external-credential-gated verification items
> remain (Google OAuth full round-trip, live Gemini) — see §9. (2026-10-15)
> Owner: _assign_
> Created: 2026-10-12

---

## 0. Locked Decisions

| Area | Decision |
|---|---|
| Backend framework | **Express** |
| Backend language/runtime | **TypeScript + Node.js** |
| Repo structure | **Plain `backend/` and `frontend/` folders**, each with its own `package.json` (no workspace tooling) |
| Authentication | **Move all auth to the backend** (signup, login, Google OAuth, OTP, password reset, sessions/JWT) |
| Frontend ↔ Backend | **REST** over `NEXT_PUBLIC_API_URL`, `credentials: "include"`, CORS with `FRONTEND_URL` |
| Shared code | Small set (zod validations + resume/session types) **duplicated** into both `shared/` folders, kept in sync manually |
| tRPC | **Removed** (currently scaffolded but empty and unused) |
| Cleanup of dead code/deps | **Included** as optional Phase 15 |

---

## 1. Current State (what we are separating)

Monolithic Next.js 14 App Router app (T3 stack). All backend code currently lives
inside the Next.js app under `src/`.

- **`src/app/api/**`** — 21 route handlers (auth, resumes, AI, practice, statistics, health).
- **`src/server/**`** — `db.ts`, `redis.ts`, `api/` (empty tRPC), `auth/` (NextAuth adapter + credentials).
- **Server-only `src/lib/**`** — `auth.ts`, `prisma.ts`, `db.ts`, `redis.ts`, `rate-limit.ts`, `email.ts`, `gemini.ts`, `password-reset.ts`, `user-cache.ts`, `auth-cache.ts`, `api-cache.ts`, `batch-queries.ts`, `services/*`, `templates/*`, `validations/*`, `types/*`.
- **`prisma/schema.prisma`** + `prisma/migrations/`.
- **Frontend** — `src/app/**` (pages), `src/components/**`, `src/hooks/**`, `src/providers/**`, `src/styles/**`.
- **Auth** — NextAuth v5 JWT, session-cookie based; `src/middleware.ts` guards routes.
- **tRPC** — scaffolded but **empty and unused** (`appRouter = createTRPCRouter({})`), `TRPCReactProvider` never mounted.
- **External services** — Google Gemini (`@google/generative-ai`), ATS microservice `http://23.94.74.248:5000/api/v1/ats-score`, HaveIBeenPwned (`api.pwnedpasswords.com`), Gmail SMTP via nodemailer.

### 1.1 Known inconsistencies / coupling problems (must fix during split)

1. **Backend imports a React component** — `api/resumes/[id]/download/route.ts` imports `@/components/resume/pdf-templates/modern` (`@react-pdf/renderer`).
2. **Client hook imports server code** — `src/hooks/use-cache-keys.ts` imports `@/server/redis`.
3. **Client page bundles a server SDK** — `resume-builder/editor/[id]/page.tsx` imports `@/lib/gemini` (`@google/generative-ai`).
4. **Duplicate Prisma singletons** — `lib/db.ts`, `lib/prisma.ts`, `server/db.ts`.
5. **Two Redis layers** — `server/redis.ts` (in-memory Map core) vs `lib/redis.ts` (wrapper with different cache key prefixes).
6. **Server components query DB directly** — `src/app/page.tsx`, `(dashboard)/layout.tsx`, `recent-interviews.tsx`, etc.
7. **Relative `fetch("/api/...")` calls** throughout frontend.
8. **Auth is deeply NextAuth-coupled** — adapter, credentials provider, `getToken` middleware, `next.auth/react` hooks.
9. **tRPC is dead scaffolding** — route mounted, router empty, provider unmounted.
10. **Missing route referenced by frontend** — `/api/job-descriptions` does not exist (`lib/services/job-description.ts`).
11. **Empty route** — `src/app/api/cron/weekly-reset/route.ts` is 0 bytes.
12. **Duplicate types** — two `ResumeAnalysisResult` definitions (`lib/gemini.ts` vs `src/types/resume.ts`).

---

## 2. Target Structure

```
Interview-Genie/
├── backend/                       # TypeScript + Node.js + Express
│   ├── src/
│   │   ├── index.ts               # bootstrap + listen
│   │   ├── app.ts                 # express app, middleware wiring, route mounting
│   │   ├── config/                # env.ts, prisma.ts, redis.ts
│   │   ├── middleware/            # auth.ts, cors.ts, rate-limit.ts, error.ts, not-found.ts
│   │   ├── routes/                # auth, resumes, resume-analysis, practice,
│   │   │                          #   statistics, ai, health, cron
│   │   ├── controllers/           # (optional) request handlers split from routes
│   │   ├── services/              # email, gemini, password-reset, pdf, preview, job-description
│   │   ├── lib/                   # user-cache, auth-cache, api-cache, batch-queries, utils
│   │   ├── templates/             # pdf/ (react-pdf), latex/, email/
│   │   ├── shared/                # types + zod validations (mirrored in frontend)
│   │   └── types/
│   ├── prisma/                    # schema.prisma + migrations/
│   ├── scripts/                   # ensure-database.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── .env.example
│   └── start-database.sh
├── frontend/                      # Next.js (App Router, no API/auth/prisma)
│   ├── src/
│   │   ├── app/                   # pages only (no src/app/api)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── providers/
│   │   ├── styles/
│   │   ├── lib/                   # api-client, utils, shared types/validations
│   │   └── middleware.ts          # cookie-presence route guard only
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── components.json
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   ├── prettier.config.js
│   └── .env / .env.example
└── task.md
```

---

## 3. Auth Migration (largest change)

Because auth is moving entirely to the backend, NextAuth is removed from the
frontend and reimplemented as first-party endpoints in the backend.

### 3.1 Backend auth endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/signup` | POST | Create user (bcrypt), create OTP, send OTP + welcome email |
| `/api/auth/login` | POST | Credentials login (email/password), issue JWT |
| `/api/auth/logout` | POST | Clear auth cookie |
| `/api/auth/session` | GET | Return current session/user from JWT |
| `/api/auth/google` | GET | Start Google OAuth 2.0 consent redirect |
| `/api/auth/google/callback` | GET | Exchange code, upsert user/account, issue JWT, redirect to frontend |
| `/api/auth/verify-otp` | POST | Verify OTP, mark user verified |
| `/api/auth/verify/resend` | POST | Resend OTP |
| `/api/auth/forgot-password` | POST | Generate reset token + send email |
| `/api/auth/reset-password` | POST | Validate token, HIBP check, set new password |

### 3.2 Session / token strategy

- JWT signed with `AUTH_SECRET`.
- Delivered as an **httpOnly**, `sameSite=lax`, `secure` (prod) cookie.
- Cookies ignore port, so `localhost:3000` (frontend) and `localhost:4000`
  (backend) share them in dev. In production set `Domain=.yourdomain`.
- CORS enabled with `origin: FRONTEND_URL`, `credentials: true`.
- Frontend never stores secrets; it calls `/api/auth/session` and relies on the cookie.

### 3.3 Replacements

- `CustomPrismaAdapter` + `next-auth` `credentials.ts` → plain Prisma queries + `bcryptjs.compare`.
- `requireAuth` / `withAuth` / `withOptionalAuth` (`edge-auth.ts`) → Express `authMiddleware` populating `req.user`.
- `next-auth/react` (`useSession`, `signIn`, `signOut`) → new frontend `AuthProvider` + `useAuth`.
- `src/middleware.ts` (`getToken`) → cookie-presence check for route redirects only.
- `src/types/next.d.ts` session augmentation → frontend `Session` type in `shared/`.

---

## 4. Route → Express Mapping

| Current Next path | Methods | Backend route file | Notes |
|---|---|---|---|
| `/api/auth/signup` | POST | `routes/auth.ts` | |
| `/api/auth/verify-otp` | POST | `routes/auth.ts` | rate-limited |
| `/api/auth/verify/resend` | POST | `routes/auth.ts` | reads IP from headers |
| `/api/auth/forgot-password` | POST | `routes/auth.ts` | uses `NEXT_PUBLIC_APP_URL` → `FRONTEND_URL` |
| `/api/auth/reset-password` | POST | `routes/auth.ts` | HIBP external call |
| `/api/auth/[...nextauth]` | GET/POST | `routes/auth.ts` | replaced by login/logout/session/google |
| `/api/practice/start` | POST | `routes/practice.ts` | |
| `/api/practice/ping` | POST | `routes/practice.ts` | |
| `/api/practice/end` | POST | `routes/practice.ts` | upserts `PracticeStats` |
| `/api/resume-analysis` | GET/POST | `routes/resume-analysis.ts` | external ATS API |
| `/api/resumes` | GET/POST/DELETE/OPTIONS | `routes/resumes.ts` | |
| `/api/resumes/:id` | GET/PATCH/DELETE | `routes/resumes.ts` | per-section upserts |
| `/api/resumes/:id/download` | GET | `routes/resumes.ts` | uses `templates/pdf` |
| `/api/resumes/generate` | POST | `routes/resumes.ts` | Gemini |
| `/api/resumes/preview` | POST | `routes/resumes.ts` | |
| `/api/resumes/templates/preview` | GET | `routes/resumes.ts` | |
| `/api/statistics` | GET | `routes/statistics.ts` | |
| `/api/ai/analyze` | POST | `routes/ai.ts` | Gemini |
| `/api/ai/generate` | POST | `routes/ai.ts` | Gemini |
| `/api/health` | GET | `routes/health.ts` | DB + Redis checks |
| `/api/cron/weekly-reset` | — | `routes/cron.ts` | currently empty; implement or drop |
| `/api/trpc/[trpc]` | GET/POST | — | **dropped** |

Transformations:
- `NextResponse.json(...)` → `res.json(...)` / `res.status(...).json(...)`.
- `NextRequest` → Express `Request`.
- Route-segment configs (`runtime`, `dynamic`, `maxDuration`, `fetchCache`) removed — plain Node is always dynamic; timeouts handled by server/proxy config.
- Header access → `req.headers[...]`; IP via `req.ip` / `x-forwarded-for`.

---

## 5. File-by-File Move Summary

| Moves to `backend/` | Stays in `frontend/` | Duplicated into both `shared/` |
|---|---|---|
| `prisma/**` | `src/app/**` (pages) | `lib/validations/auth.ts` |
| `scripts/ensure-database.ts` | `src/components/**` | `lib/validations/resume.ts` |
| `start-database.sh` | `src/hooks/**` | `lib/types/resume.ts` |
| `src/app/api/**` → `src/routes/` | `src/providers/**` | `src/types/api.ts` |
| `src/server/**` → `src/config/` + `src/middleware/` | `src/styles/**` | `src/types/resume.ts` |
| `src/lib/{auth,prisma,db,redis,rate-limit,email,gemini,password-reset,user-cache,auth-cache,api-cache,batch-queries,edge-auth,edge-response}.ts` | `src/lib/{utils,resume-tabs}.ts` | (session types) |
| `src/lib/services/**` | `public/` | |
| `src/lib/templates/**` | `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `components.json` | |
| `src/lib/email-templates/**` | `tsconfig.json`, `.eslintrc.cjs`, `prettier.config.js` | |
| `components/resume/pdf-templates/**` (React-PDF, backend-only) | `src/lib/templates/pdf-generator.ts` (if kept; browser-only) | |
| `lib/gemini.ts` server parts → `src/services/gemini.ts` | client parts → `src/lib/api-client.ts` | |
| `src/lib/validations/**`, `src/lib/types/**` | (consume from `shared/`) | |

---

## 6. Environment Variables Split

### Backend `.env`

```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
AUTH_SECRET=              # JWT signing secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_GEMINI_API=        # optional
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=
CSRF_SECRET=              # optional
ATS_API_URL=http://23.94.74.248:5000/api/v1/ats-score
```

### Frontend `.env`

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

- Backend: replace `@t3-oss/env-nextjs` with a `zod`-validated `src/config/env.ts`.
- Frontend: use plain `process.env.NEXT_PUBLIC_*` (plus a small zod check if desired).
- Remove `next.config.js`'s `import "./src/env.js"`.

---

## 7. Shared Code Strategy

Because the repo uses plain folders (no workspace package), the shared surface is
**duplicated** into `backend/src/shared/` and `frontend/src/lib/shared/`:

- `validations/auth.ts`
- `validations/resume.ts`
- `types/resume.ts`
- `types/api.ts`
- `types/session.ts` (new)

Add a short note at the top of each file: `// SHARED — keep in sync with <other path>`.
(Optional future improvement: promote to a real `packages/shared` workspace.)

---

## 8. Phased Execution

### Phase 1 — Scaffold `backend/` — COMPLETED (2026-10-12)
- [x] `npm init`, add Express, TypeScript, `tsx`/`ts-node`, `cors`, `cookie-parser`, `zod`, `bcryptjs`, `@prisma/client`, `prisma`, `nodemailer`, `@google/generative-ai`, `@react-pdf/renderer`, `react` (for React-PDF), `pg`.
- [x] `tsconfig.json` with `jsx: react-jsx` (needed for React-PDF templates), path alias `@/*`.
- [x] Create `src/index.ts`, `src/app.ts`, base middleware (json, cookie, cors, error handler).
- [x] Add scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `db:*`.

**What was created:**

| Path | Purpose |
|---|---|
| `backend/package.json` | Deps + scripts (`dev`, `build`, `start`, `typecheck`, `lint`, `format`, `db:*`) |
| `backend/tsconfig.json` | `jsx: react-jsx`, `@/*` alias, NodeNext ESM, `outDir: dist` |
| `backend/.eslintrc.cjs`, `backend/prettier.config.cjs` | Lint/format config |
| `backend/.gitignore`, `backend/.env.example` | Ignores + env template (§6 backend vars) |
| `backend/src/config/env.ts` | zod-validated env loader (loads `.env` via `process.loadEnvFile`) |
| `backend/src/middleware/cors.ts` | CORS with `FRONTEND_URL` + `credentials: true` |
| `backend/src/middleware/error.ts` | `HttpError`, `notFoundHandler`, `errorHandler` |
| `backend/src/app.ts` | Express app: cors → json/urlencoded → cookie-parser → routes → 404 → error |
| `backend/src/index.ts` | Bootstrap + `listen` + graceful SIGINT/SIGTERM shutdown |
| `backend/src/routes/health.ts` | Base `GET /api/health` (DB/Redis checks deferred to Phase 5) |

**Verification (all passed):**
- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — emits `dist/` with aliases rewritten by `tsc-alias`
- `npm run dev` (tsx) and `node dist/index.js` both boot; `GET /api/health` → 200, `GET /` → 200, unknown route → 404 JSON, graceful shutdown works.

**Notes / deviations:**
- Backend uses ESM (`"type": "module"`, `module: NodeNext`) + `tsc-alias` to emit a runnable `dist/`.
- Added helpers beyond the literal list: `tsc-alias`, `eslint` + TS plugins, `prettier`, `@types/*`. `ts-node` not installed — `tsx` covers dev + script running.
- `src/config/env.ts` and the base `health` route were pulled forward from Phases 6/5 to make the scaffold bootable; full DB/Redis health checks still pending.


### Phase 2 — Prisma + DB scripts — COMPLETED (2026-10-12)
- [x] Move `prisma/**`, `scripts/ensure-database.ts`, `start-database.sh`.
- [x] Unify the three Prisma singletons into `src/config/prisma.ts`.

**What was done:**

| Path | Purpose |
|---|---|
| `backend/prisma/schema.prisma` | Moved from root `prisma/` (unchanged) |
| `backend/prisma/migrations/**` | 15 migrations + `migration_lock.toml` moved verbatim |
| `backend/scripts/ensure-database.ts` | Moved from root `scripts/` (unchanged; resolves `.env` → `backend/`) |
| `backend/start-database.sh` | Moved from root; now `cd`s to its own dir via `BASH_SOURCE` before `npm run db:ensure` |
| `backend/src/config/prisma.ts` | Unified singleton replacing `src/lib/db.ts`, `src/lib/prisma.ts`, `src/server/db.ts` — globalThis caching, dev query logging, explicit `datasourceUrl` from env; exports `prisma` (+ `db` alias) |
| `backend/tsconfig.json` | `rootDir: "."`, include `scripts/**/*.ts` (so scripts are typechecked); emit layout now `dist/src/*` |
| `backend/package.json` | `start` → `node dist/src/index.js` |
| `backend/.env` | Local dev env (gitignored) so Prisma CLI + backend resolve `DATABASE_URL` |

**Verification (all passed):**
- `npx prisma validate` — schema valid
- `npm run db:generate` — client generated in `backend/`
- `npm run typecheck` + `npm run lint` — clean
- `npm run build` — clean; emits `dist/` incl. `dist/scripts/ensure-database.js`
- `npm run start` — boots; `GET /api/health` → 200

**Notes / deviations:**
- Canonical export is `prisma` with a `db` alias, covering both names used by monolith code (Phase 4 ports can use either).
- The old root singletons (`src/lib/db.ts`, `src/lib/prisma.ts`, `src/server/db.ts`) are intentionally kept — the monolith still runs until Phase 8/12.
- Root `package.json` `postinstall: prisma generate` will fail on a fresh root `npm install` now that `prisma/` moved. Expected; resolved when Prisma is stripped from the frontend (Phase 8/12).
- `start-database.sh` and `db:ensure` are now fully contained in `backend/`; root copies removed.

### Phase 3 — Backend auth — COMPLETED (2026-10-13)
- [x] Implement JWT issue/verify util + auth middleware.
- [x] Implement signup, login, logout, session, Google OAuth, OTP, forgot/reset-password.
- [x] Configure CORS (credentials) + cookie options.

**What was created:**

| Path | Purpose |
|---|---|
| `backend/src/lib/jwt.ts` | `issueSessionToken` / `verifySessionToken` (jose, HS256, 30-day expiry) |
| `backend/src/config/cookies.ts` | Session cookie name (`ig_session`), OAuth state cookie, options (`httpOnly`, `sameSite=lax`, `secure` in prod, optional `COOKIE_DOMAIN`) |
| `backend/src/lib/redis.ts` | In-memory Redis-compatible store + `cache`/`sessionCache`/`rateLimiting`/`checkRedisConnection` (replaces `server/redis.ts` + `lib/redis.ts`) |
| `backend/src/lib/auth-cache.ts` | Session/user cache + auth rate limiting (next-auth `User` → shared `SessionUser`) |
| `backend/src/lib/rate-limit.ts` | Fixed-window limiter + `getClientIp` + `applyRateLimit` (Express `Request`/`Response`) |
| `backend/src/lib/utils.ts` | `generateOTP`, `generateToken`, `sha256`, `sha1` |
| `backend/src/lib/user-cache.ts` | Cached user lookups/updates against `config/prisma.ts` |
| `backend/src/services/email.ts` | nodemailer transport + `sendEmail` (gracefully skips when SMTP creds absent) |
| `backend/src/services/password-reset.ts` | Generate/validate/delete reset tokens (node:crypto) |
| `backend/src/templates/email/{otp-verification,welcome,password-reset}.ts` | Email HTML (welcome now uses `FRONTEND_URL`) |
| `backend/src/shared/types/session.ts` | `SessionUser` + `Session` (mirror of frontend) |
| `backend/src/shared/validations/auth.ts` | zod schemas: signup/login/verifyOTP/resendOTP/forgot/reset |
| `backend/src/middleware/auth.ts` | `authenticateRequest`, `authMiddleware` (401), `optionalAuthMiddleware`; augments `req.user` |
| `backend/src/routes/auth.ts` | All 10 auth endpoints (below), mounted at `/api/auth` |
| `backend/src/middleware/error.ts` | Added `ZodError` → 400 JSON handling |
| `backend/src/config/env.ts` | Added optional `BACKEND_URL` + `COOKIE_DOMAIN` |
| `backend/package.json` | Added `jose` dependency |

**Endpoints:**

| Endpoint | Method |
|---|---|
| `/api/auth/signup` | POST |
| `/api/auth/login` | POST |
| `/api/auth/logout` | POST |
| `/api/auth/session` | GET |
| `/api/auth/google` | GET |
| `/api/auth/google/callback` | GET |
| `/api/auth/verify-otp` | POST |
| `/api/auth/verify/resend` | POST |
| `/api/auth/forgot-password` | POST |
| `/api/auth/reset-password` | POST |

**Verification (all passed against a throwaway Postgres 16 container):**
- `npm run typecheck` + `npm run lint` + `npm run build` — clean.
- Signup → duplicate signup 400 → invalid body 400 → OTP (read from DB) verified → login blocked before verification (403) → login after verification 200 + httpOnly `ig_session` cookie → `GET /session` returns user → logout clears cookie → `/session` null.
- Rate limiter fires 429 after repeated login attempts (per-email+IP, 3/5min), matching the monolith.
- Forgot-password returns success without revealing account existence; reset-password rejects invalid/reused tokens (400) and accepts a valid one (200), after which the new password logs in (200) and the old one fails (401).
- Google OAuth start → 302 to `accounts.google.com` with correct `client_id`/`redirect_uri`/`scope`/`state` + `ig_oauth_state` cookie; callback with mismatched state redirects to `FRONTEND_URL/login?error=oauth_state`.
- CORS preflight returns `Access-Control-Allow-Origin: http://localhost:3000` + `Access-Control-Allow-Credentials: true`.
- Unknown route → 404 JSON.

**Notes / deviations:**
- Uses `jose` for JWT (ESM-native, same HS256 as NextAuth) instead of adding `jsonwebtoken`.
- **Bug fix:** the monolith's HIBP check hashed the password with SHA-256, but the Pwned Passwords range API only accepts SHA-1 — so breached passwords were never detected. Ported code uses `sha1()` for the breach lookup (SHA-256 is still used for reset-token hashing). Verified a known-breached password is now rejected.
- Added env vars `BACKEND_URL` (OAuth redirect base; falls back to request host) and `COOKIE_DOMAIN` (cross-subdomain prod cookies) — not in the original §6 list.
- `bcryptjs` is CommonJS, so it is imported as a default (`import bcrypt from "bcryptjs"`) to work under NodeNext ESM.
- JWT sessions cannot be hard-revoked server-side; `reset-password` clears adapter sessions + caches (equivalent to prior NextAuth JWT behavior). A denylist/token-version could be added later.
- `authMiddleware` / `optionalAuthMiddleware` are implemented but not yet attached to any route — Phase 4 wires them onto ported routers.
- Email sending is skipped with a warning when `EMAIL_USER`/`EMAIL_PASS` are unset (dev), matching the monolith's best-effort behavior.

### Phase 4 — Port route handlers — COMPLETED (2026-10-13)
- [x] Convert all 20 usable routes to Express routers (§4 mapping).
- [x] Wire routers in `app.ts`.

**What was created:**

| Path | Purpose |
|---|---|
| `backend/src/routes/statistics.ts` | `GET /api/statistics` (ATS/interview/practice/credit aggregates) |
| `backend/src/routes/practice.ts` | `POST /start`, `/ping`, `/end` (auth-gated; upserts `PracticeStats`) |
| `backend/src/routes/resumes.ts` | Collection + sub-resource CRUD, AI generate, preview, template preview, PDF download |
| `backend/src/routes/resume-analysis.ts` | `GET` (list stored analyses) + `POST` (forward multipart to ATS, persist) |
| `backend/src/routes/ai.ts` | `POST /api/ai/analyze`, `POST /api/ai/generate` (Gemini) |
| `backend/src/routes/health.ts` | Extended with DB + Redis checks and `testRedisFeatures` (was static) |
| `backend/src/services/gemini.ts` | `getGeminiModel()` wrapper (throws when `GOOGLE_GEMINI_API` unset) |
| `backend/src/services/preview.ts` | Template preview sample data + `generateTemplatePreview` |
| `backend/src/templates/pdf/modern.tsx` | React-PDF `ModernPDFTemplate` moved from `src/components/resume/pdf-templates` |
| `backend/src/shared/types/resume.ts` | `ResumeData`, `TemplateType`, external-ATS `ResumeAnalysisResult` (§7) |
| `backend/src/shared/types/api.ts` | `ApiError` (mirrored shared type) |
| `backend/src/lib/redis.ts` | Added `testRedisFeatures()` for `/api/health` |
| `backend/src/app.ts` | Mounted `statistics`, `practice`, `resumes`, `resume-analysis`, `ai` routers |

**Mounted endpoints (20):**

| Path | Methods |
|---|---|
| `/api/health` | GET |
| `/api/statistics` | GET |
| `/api/practice/start` `/ping` `/end` | POST |
| `/api/resumes` | POST / GET / DELETE / OPTIONS |
| `/api/resumes/generate` | POST |
| `/api/resumes/preview` | POST |
| `/api/resumes/templates/preview` | GET |
| `/api/resumes/:id/download` | GET |
| `/api/resumes/:id` | GET / PATCH / DELETE |
| `/api/resume-analysis` | GET / POST |
| `/api/ai/analyze` `/api/ai/generate` | POST |

**Dropped:** `/api/trpc/[trpc]` (dead tRPC) and `/api/cron/weekly-reset` (0-byte handler).

**Verification (all passed against a throwaway Postgres 16 container + a local mock ATS):**
- `npm run typecheck` + `npm run lint` + `npm run build` — clean.
- `GET /api/health` → 200 with `database: healthy` + `redis: healthy` (incl. feature checks).
- Full auth round-trip still works: signup → OTP (read from DB) → verify → login → session.
- Resumes: create → list → get (full include) → PATCH `personal`/`skills` → invalid section 400 → invalid schema 400 (zod errors) → PDF download 200 `application/pdf` (valid 1-page PDF) → delete by path and by query param → list empty.
- Statistics: returns expected aggregate shape; interview count/practice minutes update after a completed session.
- Practice: start → ping (`{success:true}`) → end (duration + `PracticeStats` upsert) all work.
- Resume analysis: `GET` returns stored analyses; `POST` forwards the raw multipart body to the ATS (verified via mock that `content-type` boundary + file + fields arrive intact) and persists the result (`totalScore`, `fileUrl`, `keywordMatchRate`).
- Preview: `POST /api/resumes/preview` → sample JSON; `GET /api/resumes/templates/preview` → 200.
- Unauthenticated access to protected routes → 401; unknown route → 404 JSON; CORS preflight → 204 with allow-origin/credentials.

**Notes / deviations:**
- `/api/resumes/preview` and `/api/resumes/templates/preview` are intentionally **unauthenticated** (monolith parity). `authMiddleware` is applied per-route rather than to the whole `resumes` router.
- `resume-analysis` POST forwards the **raw** multipart body (`express.raw({ type: "multipart/form-data" })`) with the original `Content-Type` header instead of re-encoding `request.formData()`. This preserves the boundary/fields exactly and avoids adding `multer`.
- `/api/resumes/templates/preview` keeps the monolith's behaviour verbatim (it serialises preview JSON into a buffer labelled `application/pdf`). The frontend renders previews client-side and never calls it; documented here as a pre-existing bug.
- `/api/ai/analyze` preserves the monolith's behaviour: it declared an ATS prompt but called `generateContent(resumeData)` directly. The unused prompt was dropped rather than silently applied.
- `resumes/generate` preserves two pre-existing quirks: it derives `title` from `data.personalInfo` before validating the body (so an empty body yields 500), and it surfaces raw Prisma errors. Behaviour matches the monolith.
- Some Phase 5/6 artefacts were pulled forward because routes depend on them: `services/gemini.ts`, `services/preview.ts`, `templates/pdf/modern.tsx`, and the shared resume/api types. Phase 5/6 still cover `api-cache`, `batch-queries`, remaining `templates/{latex,email}`, and the full shared validations set.
- AI routes could not be exercised end-to-end here (`GOOGLE_GEMINI_API` unset); they correctly 500 with the same messages as the monolith when the key is absent.

### Phase 5 — Port services/lib — COMPLETED (2026-10-14)
- [x] Port `email.ts`, `gemini.ts`, `password-reset.ts`, `user-cache`, `auth-cache`, `api-cache`, `batch-queries`, `rate-limit`.
- [x] Redis: keep in-memory store (single-instance); `ioredis` swap documented as a limitation (§10).
- [x] Move React-PDF templates into `src/templates/pdf/`; JSON/preview template generator into `src/services/preview.ts`.

**What was done (this phase):**

| Path | Purpose |
|---|---|
| `backend/src/lib/api-cache.ts` | Ported from `src/lib/api-cache.ts`: re-exports `cache`/`revalidateTag`, `createCachedResponse` (Next `Response` → Express `res`), and cached `getUserData` |
| `backend/src/lib/batch-queries.ts` | Ported from `src/lib/batch-queries.ts`: `getDashboardData`, `getUserStatistics`, `getBatchedResumeAnalyses`, `getBatchedPracticeSessions`, `invalidateUserCaches` (imports unified to `config/prisma` + `lib/redis`) |

The remaining services listed for this phase (`email.ts`, `gemini.ts`, `password-reset.ts`, `user-cache`, `auth-cache`, `rate-limit`, in-memory Redis, React-PDF templates, preview generator) were already ported and verified in Phases 3–4; Phase 5 only needed to close the `api-cache` / `batch-queries` gap.

**Verification (all passed against a throwaway Postgres 16 container on port 5433):**
- `npm run typecheck` + `npm run lint` + `npm run build` — clean.
- `prisma migrate deploy` — all 15 migrations applied.
- `npm run start` boots; `GET /api/health` → 200 with `database: healthy` + `redis: healthy` (features ok).
- Full smoke run: signup → OTP (read from DB) → verify → login (httpOnly `ig_session` cookie) → session → create/get/patch/list/delete resume → PDF download 200 `application/pdf` (valid `%PDF-` body) → statistics → practice start/ping/end → template preview 200; unauthenticated protected route 401; unknown route 404; CORS preflight returns allow-origin + credentials; logout clears session.
- Runtime import test (temporary `scripts/verify-phase5.ts`, since removed) exercised both new modules end-to-end: `getUserData`, `getDashboardData`, `getUserStatistics`, `getBatchedResumeAnalyses`, `getBatchedPracticeSessions`, `invalidateUserCaches` — all returned correct results.

**Notes / deviations:**
- `api-cache` and `batch-queries` are **not consumed by any backend route** (in the monolith they were only referenced by dead hooks/types — see §11). They are ported for parity and future use; only their types/utilities are exercised today.
- `createCachedResponse` was adapted to Express (`res.status(...).set(...).json(...)`) instead of returning a web `Response`.
- Monolith artefacts that are **dead and unreferenced** — `src/lib/templates/latex/**`, `src/lib/templates/pdf-generator.ts`, `src/lib/email-templates/login-attempt.ts`, and `src/lib/services/job-description.ts` — were intentionally **not** ported; they are tracked under Phase 14 (§11) cleanup.
- The monolith's `src/lib/gemini.ts` `analyzeResume` export was unused (the `/api/resumes/generate` route has its own inline helper); the backend keeps only `services/gemini.ts#getGeminiModel`, which the ported routes use.

### Phase 6 — Backend shared — COMPLETED (2026-10-14)
- [x] Create `src/shared/` with validations + types.
- [x] Add `// SHARED — keep in sync with …` headers to every mirrored file (§7).

**Shared surface (`backend/src/shared/`):**

| Path | Source | Notes |
|---|---|---|
| `validations/auth.ts` | `src/lib/validations/auth.ts` | Ported in Phase 3; signup/login/verifyOTP/resend/forgot/reset schemas |
| `validations/resume.ts` | `src/lib/validations/resume.ts` | **New this phase** — per-section schemas + `validateSection` + `isSectionComplete` |
| `types/resume.ts` | `src/lib/types/resume.ts` + `src/types/resume.ts` | `ResumeData`, `TemplateType`, external-ATS `ResumeAnalysisResult`, plus `SectionScores`/`DetailedBreakdown`/`Improvement*`/`StoredResumeAnalysis` (added this phase) |
| `types/api.ts` | `src/types/api.ts` | `ApiError` |
| `types/session.ts` | new | `SessionUser` + `Session` (replaces `src/types/next.d.ts` NextAuth augmentation) |

**Verification (all passed):**
- `npm run typecheck` + `npm run lint` + `npm run build` — clean (shared files are included in `tsc`).
- Runtime test (temporary `scripts/verify-phase6.ts`, since removed) against the shared validations — 14/14 checks passed: `validateSection` for valid/invalid/unknown sections, skills defaults, `isSectionComplete` for achievements/skills/personal edge cases, `personalSchema` empty-string optionals, `skillsSchema` requiring `technical`, and `StoredResumeAnalysis` importing via `tsc`.

**Notes / deviations:**
- `validateSection`'s `TabId` is **mirrored locally** in the shared file instead of importing `@/lib/resume-tabs` (that module carries lucide-react icons and stays frontend-only per §5).
- The monolith's debug `console.log`s inside `isSectionComplete` were dropped; the return values are unchanged.
- The backend resume routes keep their own inline per-section schemas (matching the monolith's `api/resumes/[id]/route.ts`, which also inlines them) rather than importing the shared validations — no behaviour change. The shared `validations/resume.ts` exists for the frontend mirror and future use.
- `frontend/src/lib/shared/**` is now populated by the mirror (see Phase 7); the sync headers reference the backend paths.

### Phase 7 — Scaffold `frontend/` — COMPLETED (2026-10-14)
- Copied `src/`, `public/`, and config files (`next.config.js`, `tsconfig.json`, `.eslintrc.cjs`, `prettier.config.js`, `components.json`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`) into `frontend/`.
- Wrote frontend-only `frontend/package.json` (`interview-genie-frontend`): all UI deps (Radix, React Query, framer-motion, recharts, etc.) and dev deps; **no** Prisma/NextAuth/trpc/PDF/Gemini/nodemailer/bcryptjs. `npm install` succeeded.
- Mirrored shared code into `frontend/src/lib/shared/{types,validations}/` (from `backend/src/shared/**`, sync headers point back to backend):
  - `types/resume.ts`, `types/api.ts`, `types/session.ts`, `validations/auth.ts`, `validations/resume.ts`.
- Migrated all legacy imports (`@/lib/types/resume`, `@/lib/validations/*`, `@/types/*`) to `@/lib/shared/...`.

### Phase 8 — Strip backend concerns from frontend — COMPLETED (2026-10-14)
- Deleted `frontend/src/app/api/**`, `frontend/src/server/**`, `frontend/src/trpc/**`, `frontend/src/env.js`, `frontend/src/types/next.d.ts`.
- Deleted server-only libs: `auth.ts`, `auth-cache.ts`, `db.ts`, `edge-auth.ts`, `edge-response.ts`, `email.ts`, `email-templates/`, `gemini.ts`, `password-reset.ts`, `prisma.ts`, `rate-limit.ts`, `redis.ts`, `user-cache.ts`, `api-cache.ts`, `batch-queries.ts`, `services/`, `templates/latex/`, `templates/pdf-generator.ts`, `components/resume/pdf-templates/`.
- Deleted dead/unused: hooks `use-cache-keys.ts`, `use-dashboard-data.ts`, `use-practice-sessions.ts`, `use-resume-analyses.ts`; `components/providers.tsx`.

### Phase 9 — Rewrite frontend data layer — COMPLETED (2026-10-14)
- Added `src/lib/api-client.ts`: `API_URL` (`NEXT_PUBLIC_API_URL`), `apiFetch` (`credentials: "include"`), `apiRequest`, `ApiError`, `apiClient` helper.
- Replaced every client `fetch("/api/...")` with `apiFetch` (auth forms, resume builder/view/optimizer, statistics, health, template preview, `use-save-resume`, `use-practice-time`) — 21 call sites.
- Added `src/lib/ai-client.ts` (`generateResumeContent` → `POST /api/ai/generate`); editor page now imports it instead of the deleted `@/lib/gemini`.
- DB-backed server components converted to `getServerSession()` (`src/lib/server-session.ts` forwards cookies to backend `/api/auth/session`): root `page.tsx`, `(dashboard)/layout.tsx`, dashboard `page.tsx` + `@content/page.tsx`; `@error/page.tsx` now pings `/api/auth/session`.
- `use-practice-time.ts` rewritten to use `useAuth()` + `apiFetch` with local `PracticeSession`/`PracticeStats` types (dropped `@prisma/client`).

### Phase 10 — Rewrite frontend auth — COMPLETED (2026-10-14)
- Added `src/providers/auth-provider.tsx` (`AuthProvider`, `useAuth` with `session/user/status/signIn/signOut/refresh`); `signIn("credentials")` → `POST /api/auth/login`, `signIn("google")` → redirect to `${API_URL}/api/auth/google`, `signOut` → `POST /api/auth/logout`.
- `src/lib/auth-utils.ts` re-exports `useAuth`; `components/providers/session-provider.tsx` wraps `AuthProvider`.
- Updated `login-form.tsx`, `social-login-buttons.tsx`, `dashboard/user-nav.tsx`; error boundaries clear `ig_session` instead of next-auth cookies.
- Rewrote `src/middleware.ts` to a cookie-presence route guard (`ig_session`); fixed the original `startsWith("/")` bug (now exact-match for `/`).

### Phase 11 — Env files — COMPLETED (2026-10-14)
- Added `frontend/.env` + `frontend/.env.example` with `NEXT_PUBLIC_API_URL=http://localhost:4000`.
- `next.config.js` rewritten (removed `import "./src/env.js"`). Added `"root": true` to `frontend/.eslintrc.cjs` so ESLint no longer cascades into the root monolith config.
- Verified: `npx tsc --noEmit` OK, `npm run lint` exit 0 (warnings only), `npm run build` succeeds (all routes dynamic).

### Phase 12 — Root housekeeping — COMPLETED (2026-10-15)
- [x] Rewrote root `.gitignore` for the two-project layout (recursive
  `node_modules/`, `dist/`, `.next/`, `.env`, `*.tsbuildinfo`, prisma `*.db`,
  `next-env.d.ts`, logs, `.vercel`, etc.; keeps `.env.example` committed).
- [x] Rewrote `README.md` with two-project setup, architecture, env vars,
  run instructions, and per-project scripts.
- [x] Removed the old monolithic root app (git history retained).

**What was done:**

| Removed from root | Reason |
|---|---|
| `src/` | Entire monolith (pages + 21 API routes + `server/` + `trpc/`) now lives in `frontend/` (pages) and `backend/` (REST) |
| `public/` | Duplicated into `frontend/public/` |
| `scripts/` (empty), `components.json`, `next.config.js`, `tsconfig.json`, `.eslintrc.cjs`, `prettier.config.js`, `postcss.config.js`, `tailwind.config.ts` | Duplicated into `frontend/` |
| `package.json`, `package-lock.json` | Monolith manifest; replaced by `backend/package.json` + `frontend/package.json` |
| `vercel.json`, `.env.example` | Monolith-specific (Next.js function config + NextAuth env) |

**Kept at root:** `backend/`, `frontend/`, `docs/`, `README.md`, `.gitignore`, `task.md`.

**Verification (all passed):**
- `backend`: `npm run typecheck` + `npm run lint` clean; `npm run build` → exit 0.
- `frontend`: `npm run typecheck` clean; `npm run lint` exit 0 (warnings only); `npm run build` → exit 0 (24 routes).
- Root now contains only the two standalone projects + docs/README/task.md.

### Phase 13 — Verification (see §9) — FRONTEND + BACKEND CODE VERIFIED (2026-10-15)
- Static checks + frontend runtime smoke pass (see §9).
- Two items remain unchecked and are **blocked on external credentials**:
  Google OAuth full round-trip and live Gemini AI calls (`GOOGLE_CLIENT_ID`/
  `GOOGLE_CLIENT_SECRET`/`GOOGLE_GEMINI_API` are unset in `backend/.env`).

### Phase 14 — Optional cleanup (see §11) — COMPLETED (2026-10-15)
Resolved by removing the old root monolith in Phase 12 (all listed items were
root-only). Verified no residue in the new projects:

| Cleanup item | Result |
|---|---|
| tRPC scaffolding (`src/trpc/**`, `@trpc/*`, `superjson`) | Gone with root; zero `@trpc`/`superjson` refs in `backend/src` + `frontend/src` |
| Dead hooks (`use-cache-keys`, `use-dashboard-data`, `use-practice-sessions`, `use-resume-analyses`) | Gone; not present in either project |
| Dead files (`pdf-generator.ts`, `components/providers.tsx`, empty `cron/weekly-reset`) | Gone; not present in either project |
| Unused deps (`zustand`, `@tabler/icons-svelte`, `svelte-motion`, `prompt-sync`, `@prisma/extension-accelerate`) | Gone with root `package.json`; not present in `backend/` or `frontend/` manifests |
| Broken reference `/api/job-descriptions` (`lib/services/job-description.ts`) | Gone with root; zero `job-description` references in `frontend/` |
| Duplicate `ResumeAnalysisResult` | Single definition per project (one in each `shared/` mirror — expected duplication, not drift)

---

## 9. Verification Checklist ("nothing broke")

### Backend
- [x] `npm run typecheck` + `npm run lint` pass.
- [x] Server boots; `GET /api/health` returns healthy (DB + Redis).
- [x] Prisma migrations apply cleanly (`prisma migrate deploy`).

### Auth
- [x] Signup → OTP email → verify OTP → login → session → logout.
- [ ] Google OAuth full round-trip; user + account upserted. _(start + state validation verified; full round-trip needs real Google creds)_
- [x] Forgot password → reset link → reset (HIBP breach check works).
- [x] Protected endpoint rejects missing/invalid JWT; accepts valid cookie. _(verified Phase 4 across resumes/statistics/practice/resume-analysis)_

### Features
- [x] Resumes: list, create, edit, per-section PATCH, delete.
- [x] Resume AI generate _(routes ported; live call needs `GOOGLE_GEMINI_API`)_; ATS analysis via external service _(forwarding + persistence verified against a mock ATS)_.
- [x] PDF download renders correctly (React-PDF moved to backend).
- [x] Template preview endpoints.
- [x] Practice start/ping/end; statistics aggregation.
- [ ] AI analyze/generate. _(routes ported; not exercised — `GOOGLE_GEMINI_API` unset)_
- [x] Cron route — **dropped** (empty in monolith; see §11).

### Frontend
- [x] `npm run build` + `npm run lint` + `npm run typecheck` pass. _(2026-10-14: tsc exit 0, lint exit 0 warnings only, build green, all routes dynamic)_
- [x] All routes load; no 500s. _(`next start` smoke: 24 routes built; `/login`, `/signup`, `/forgot-password`, `/verify-otp` → 200)_
- [x] CORS + cross-origin cookies work; session persists on refresh. _(preflight `Origin: localhost:3000` → 204, `allow-credentials: true`; login cookie → frontend `/dashboard` SSR 200, `/login` → 307 `/dashboard`)_
- [x] Middleware redirects unauthenticated users; redirects authed users away from auth pages. _(`/` → 307 `/login`; `/dashboard` → 307 `/login?callbackUrl=%2Fdashboard`; authed `/login` → 307 `/dashboard`)_
- [x] No server-only imports in client bundles.

### Static checks
- [x] `grep` confirms zero references to `@/server`, `@prisma/client`, `next-auth` in `frontend/`.
- [x] No relative `/api/...` fetches remain in `frontend/`. _(all replaced with `apiFetch`)_
- [x] Client bundle inlines `http://localhost:4000` (`NEXT_PUBLIC_API_URL`) as expected.

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Cross-origin auth cookies fail | Same-site in dev (localhost ignores port); `Domain=.domain` + `secure` + `sameSite` in prod; test early |
| Server components relied on direct DB access | Forward auth cookie to backend via `next/headers`, or convert to client fetch |
| React-PDF needs JSX in backend | Enable `jsx` in backend tsconfig; keep `react` dep backend-only |
| Redis is in-memory (per-instance) | Document limitation; plan `ioredis` for multi-instance deployments |
| External ATS API hard-coded IP | Move to `ATS_API_URL` env var |
| Dead tRPC removal breaks imports | Remove `src/trpc`, `src/server/api`, `@trpc/*`, `superjson`; verify no imports remain |
| Type drift between duplicated shared files | Keep small; add sync notes; optional future shared package |
| Mobile/other clients | Bearer-token support in addition to cookie for future non-browser clients |

---

## 11. Optional Cleanup Phase

Remove (after the split is verified):

- **tRPC scaffolding**: `src/trpc/**`, `backend/src/routes` not needed, `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `superjson`.
- **Dead hooks**: `use-dashboard-data.ts`, `use-practice-sessions.ts`, `use-resume-analyses.ts`, `use-cache-keys.ts`.
- **Dead files**: `src/lib/templates/pdf-generator.ts`, `src/components/providers.tsx`, empty `api/cron/weekly-reset`.
- **Unused deps**: `zustand`, `@tabler/icons-svelte`, `svelte-motion`, `prompt-sync`, `@prisma/extension-accelerate`.
- **Broken reference**: implement or remove `/api/job-descriptions` used by `lib/services/job-description.ts`.
- **Duplicate types**: reconcile the two `ResumeAnalysisResult` definitions into `shared/types`.

---

## 12. Definition of Done

- [x] `backend/` runs standalone, serves all former `/api/**` functionality over REST, owns Prisma + auth + PDF + email + AI.
- [x] `frontend/` is a pure Next.js UI that talks to the backend via `NEXT_PUBLIC_API_URL`.
- [x] All items in §9 pass — except two external-credential-gated checks
  (Google OAuth full round-trip, live Gemini), which cannot run without real
  credentials; all code paths for them are ported and typecheck/build-clean.
- [x] `task.md` updated / checked off.
