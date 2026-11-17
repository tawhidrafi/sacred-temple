# temple-cf — Agent Instructions

## Stack
- Nuxt 4 (Vue 3 + Vite + Nitro), tRPC (`trpc-nuxt`), Zod, Drizzle ORM, better-auth
- Cloudflare Workers + D1 (SQLite) + R2 (media), deployed via wrangler
- Bun is the package manager only; run Nuxt with Node (`nuxt dev` / `nuxt build`)

## Core rules (from md/first-setup.md)
1. Bun is the package manager only. Do not use `bunx --bun` or `Bun.*` APIs.
2. Server code must be Workers-compatible: web-standard APIs only, no `fs`, no native Node modules, no `bun:sqlite`.
3. Database only through the D1 binding (`event.context.cloudflare.env.DB`) with `drizzle-orm/d1`.
4. Create the Drizzle instance per request inside the tRPC context, never at module level.
5. No interactive transactions (D1 doesn't support them). Use `db.batch([...])` for atomic multi-statement writes.
6. App code imports server types with `import type` only. Never import runtime server code in `app/`.
7. Secrets via Nuxt `runtimeConfig` with `NUXT_`-prefixed env vars (`.env`, git-ignored). Read with `useRuntimeConfig(event)`.
8. Schema changes always go through Drizzle migrations, never manual edits.

## Commands
- `bun run dev` — dev server (`nuxt dev`)
- `bun run build` — production build (`nuxt build`)
- `bun run typecheck` — `nuxt typecheck`
- `bun run test` — vitest
- `bun run db:generate` — drizzle-kit generate migrations
- `bun run db:local` — apply migrations to local D1
- `bun run db:remote` — apply migrations to remote D1
- `bun run db:patch:remote` — apply `sql/0013_fix_patch.sql` remotely
- `bun run seed` / `bun run seed:admin` — seed database

## Folder structure
- `app/` — Vue pages, components, plugins, composables, utils
- `server/` — Nitro server: `api/`, `trpc/`, `db/`, `services/`, `cms/`, `middleware/`, `utils/`
- `shared/` — `schemas/`, `types/`, `constants/` (shared client + server)
- `drizzle/` — generated migrations (commit these)
- `sql/` — patch / seed SQL
- `tests/` — vitest tests
- `scripts/` — seed / export scripts
- `md/` — project documentation

## tRPC patterns
- Routers in `server/trpc/routers/`, registered in `server/trpc/routers/index.ts`
- Procedures: `publicProcedure`, `protectedProcedure` (any authed role), `staffProcedure` (admin/editor), `adminProcedure` (admin)
- Context (`server/trpc/context.ts`): `db`, `mediaBucket`, `session`, `user`, `event`
- Roles (`shared/types`): `admin` | `editor` | `user`
- Validate inputs with Zod; export `AppRouter` type from the router index

## Database
- Schema: `server/db/schema.ts`
- Migrations: `drizzle/` (versioned SQL, commit them)
- Workflow: edit `schema.ts` → `bun run db:generate` → `bun run db:local` (or `--remote`)

## Testing
- Vitest in `tests/`; run `bun run test`

## Gotchas
- R2 bucket binding (`MEDIA`) is disabled in `wrangler.jsonc` until R2 is enabled in Cloudflare Dashboard and the `temple-cf-media` bucket is created.
- `compatibilityDate` is pinned; bump deliberately.
- Test a production build locally with `wrangler dev` before first deploy (`nuxt preview` may not replicate the Cloudflare preset).
- Admin routes (`/admin/**`, `/account/**`) use `ssr: false` in `nuxt.config.ts`.
