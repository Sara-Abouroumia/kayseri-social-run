# Tech stack (recommended)

Practical defaults for implementing [the product vision](./APP.md) while reading well for **senior full-stack** and **DevSecOps** portfolio use. It builds on what the repository already uses where possible.

---

## Current baseline (repository)

| Layer | Choice |
| --- | --- |
| Framework | **Next.js** (App Router) |
| UI | **React**, **TypeScript** |
| Styling | **Tailwind CSS** |
| Linting | **ESLint** (`eslint-config-next`) |

---

## Application (full stack)

| Concern | Recommendation | Notes |
| --- | --- | --- |
| Data store | **PostgreSQL** | Relational model for clubs, memberships, events, RSVPs, roles |
| Data access | **Drizzle** *or* **Prisma** | Migrations and type-safe queries; pick one and standardize |
| API shape | **tRPC** *or* **REST + OpenAPI** with **Zod** | End-to-end types vs explicit HTTP contracts—both defensible |
| Auth | **Auth.js (NextAuth)** *or* **Clerk** | Auth.js shows deeper ownership of sessions and OAuth/passkeys |
| Validation / env | **Zod** | Shared schemas for forms, APIs, and `process.env` |
| Maps | **MapLibre GL** + **OpenStreetMap** tiles *or* **Mapbox** | Meeting points, routes, live markers |
| Realtime (live sessions) | **Partykit**, **Ably**, or similar managed **WebSockets** | Join-gated live coordinator location without running your own socket farm first |
| Media (gallery) | **S3-compatible storage** (e.g. **Cloudflare R2**, AWS S3) + **presigned upload URLs** | Standard, scalable pattern |
| Background / reminders | **Vercel Cron** + route handlers, or **Inngest** / **Trigger.dev** | Announcements, digests, session expiry hooks |
| Client server state | **TanStack Query** | Caching and consistency for events and participation |
| Forms | **React Hook Form** + Zod | Less boilerplate, strong validation story |

---

## Quality and frontend depth

| Area | Recommendation |
| --- | --- |
| Unit / component tests | **Vitest**, **React Testing Library** |
| E2E (smoke) | **Playwright** — e.g. join flow, coordinator starts live session |

---

## DevSecOps (portfolio-credible)

| Practice | Tools / patterns |
| --- | --- |
| CI | **GitHub Actions**: install, lint, typecheck, test, build on every PR |
| Dependencies | **Dependabot**; intentional versioning; periodic review |
| Secrets in repo | **Gitleaks** or **TruffleHog** (or GitHub secret scanning); fail CI on findings |
| Static analysis | **CodeQL** on default branch / PRs where available |
| Runtime hardening | **CSP**, secure cookies (**HttpOnly**, **SameSite**), **rate limiting** on auth and live endpoints (e.g. **Upstash Redis**) |
| Containers (optional) | **Docker** + **docker-compose** for app + Postgres locally and reproducible demos |
| IaC (optional, high signal) | **Terraform** or **Pulumi** for a minimal cloud footprint (DB, bucket, IAM) |
| Observability | **Sentry** (errors + performance) and/or **OpenTelemetry** export to a vendor; **structured JSON logs** + request correlation |

---

## Deployment (pick one story and document it)

| Target | Typical fit |
| --- | --- |
| **Vercel** + managed Postgres (Neon, Supabase, RDS, etc.) | Fastest path for Next.js |
| **Fly.io** / **Railway** / similar | Good when you want Docker-first and explicit networking |

---

## Suggested one-liner for a CV

TypeScript full stack on **Next.js** and **PostgreSQL**, with typed APIs and validation, secure auth, realtime coordination for join-gated live sessions, object storage for media, **CI/CD** with tests and static/secret checks, and **observability** for production-like operations.

---

## Rollout discipline

Adopt the stack in **layers**: database + auth + events + participation first; then maps and meeting points; then one managed realtime path for live coordination; then media uploads; then deepen CI and observability. Avoid listing tools in the README that are not actually in use.
