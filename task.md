# Task: Separate Backend (TypeScript + Node/Express) and Frontend (Next.js)

> Goal: Split the current monolithic Next.js (T3 stack) application into two
> independent projects at the repo root — `backend/` (TypeScript + Node.js +
> Express) and `frontend/` (Next.js) — without breaking any existing feature.
>
> Status: IN PROGRESS — **Phase 2 complete** (2026-10-12)
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

### Phase 3 — Backend auth
- Implement JWT issue/verify util + auth middleware.
- Implement signup, login, logout, session, Google OAuth, OTP, forgot/reset-password.
- Configure CORS (credentials) + cookie options.

### Phase 4 — Port route handlers
- Convert all 20 usable routes to Express routers (§4 mapping).
- Wire routers in `app.ts`.

### Phase 5 — Port services/lib
- `email.ts` (nodemailer), `gemini.ts`, `password-reset.ts`, `user-cache`, `auth-cache`, `api-cache`, `batch-queries`, `rate-limit`.
- Redis: keep in-memory store (single-instance) or swap to `ioredis` (documented limitation).
- Move React-PDF templates into `src/templates/pdf/`; JSON/preview template generator into `src/services/preview.ts`.

### Phase 6 — Backend shared
- Create `src/shared/` with validations + types.

### Phase 7 — Scaffold `frontend/`
- Copy pages/components/hooks/providers/styles/public and config files.
- Install frontend deps only (React, Next, Radix, Tailwind, React Query, etc.).

### Phase 8 — Strip backend concerns from frontend
- Delete `frontend/src/app/api/**`, `frontend/src/server/**`, `frontend/prisma/**`.
- Remove Prisma, NextAuth, nodemailer, bcryptjs, Gemini SDK, React-PDF from frontend deps.

### Phase 9 — Rewrite frontend data layer
- Add `src/lib/api-client.ts` (base URL + `credentials: "include"` + error handling).
- Replace every `fetch("/api/...")` with `apiClient`.
- Convert server components that used DB (`src/app/page.tsx`, `(dashboard)/layout.tsx`, `recent-interviews.tsx`, etc.) to fetch backend, forwarding the cookie via `next/headers`, or make them client components.

### Phase 10 — Rewrite frontend auth
- Add `AuthProvider`, `useAuth`, update login/signup/social buttons/user-nav.
- Rewrite `src/middleware.ts` to check auth-cookie presence only.

### Phase 11 — Env files
- Create backend/frontend `.env` + `.env.example` per §6.
- Update `next.config.js` (remove `env.js` import); add `NEXT_PUBLIC_API_URL`.

### Phase 12 — Root housekeeping
- Update root `.gitignore` (node_modules, .env, .next, dist, prisma artifacts).
- Update `README.md` with two-project setup instructions.
- Decide the fate of the old root `src/`, root configs, and root `package.json`
  (recommend removing after verification; keep git history).

### Phase 13 — Verification (see §9)

### Phase 14 — Optional cleanup (see §11)

---

## 9. Verification Checklist ("nothing broke")

### Backend
- [ ] `npm run typecheck` + `npm run lint` pass.
- [ ] Server boots; `GET /api/health` returns healthy (DB + Redis).
- [ ] Prisma migrations apply cleanly (`prisma migrate deploy`).

### Auth
- [ ] Signup → OTP email → verify OTP → login → session → logout.
- [ ] Google OAuth full round-trip; user + account upserted.
- [ ] Forgot password → reset link → reset (HIBP breach check works).
- [ ] Protected endpoint rejects missing/invalid JWT; accepts valid cookie.

### Features
- [ ] Resumes: list, create, edit, per-section PATCH, delete.
- [ ] Resume AI generate; ATS analysis via external service.
- [ ] PDF download renders correctly (React-PDF moved to backend).
- [ ] Template preview endpoints.
- [ ] Practice start/ping/end; statistics aggregation.
- [ ] AI analyze/generate.
- [ ] Cron route (if kept).

### Frontend
- [ ] `npm run build` + `npm run lint` + `npm run typecheck` pass.
- [ ] All routes load; no 500s.
- [ ] CORS + cross-origin cookies work; session persists on refresh.
- [ ] Middleware redirects unauthenticated users; redirects authed users away from auth pages.
- [ ] No server-only imports in client bundles.

### Static checks
- [ ] `grep` confirms zero references to `@/server`, `@prisma/client`, `next-auth` in `frontend/`.
- [ ] No relative `/api/...` fetches remain in `frontend/`.

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

- [ ] `backend/` runs standalone, serves all former `/api/**` functionality over REST, owns Prisma + auth + PDF + email + AI.
- [ ] `frontend/` is a pure Next.js UI that talks to the backend via `NEXT_PUBLIC_API_URL`.
- [ ] All items in §9 pass.
- [ ] `task.md` updated / checked off.
