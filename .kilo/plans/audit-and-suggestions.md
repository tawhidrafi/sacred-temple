# Codebase Review & Suggestions — temple-cf (Nuxt + Cloudflare Workers + D1)

Saved for future reference. Generated 2026-11-17.

## What this repo does

Temple website (Golpahar Mohashoshan Kali Mandir, Chittagong) built with Nuxt 4 + Vue 3, tRPC, Zod, Drizzle ORM, better-auth; deployed on Cloudflare Workers + D1 (SQLite) + R2 (media). Public pages + public forms (puja booking, contact, volunteer) protected by Turnstile + honeypot; admin CMS with role-based auth (admin/editor/user) and audit logging. Assumed load: many public visitors plus a small number of admins across many Worker isolates.

## Must fix

**1. Hardcoded default auth secret** (`server/utils/auth.ts:L19`)
`getAuth()` falls back to literal `"temple-default-dev-secret-change-in-prod-min-32-chars"` when `BETTER_AUTH_SECRET` unset. Every instance shares a predictable secret; attacker can forge session cookies and escalate to admin. Remove default; throw in production when missing.

**2. Runtime schema auto-patching hides migrations** (`server/services/bookings.ts:L31-75`, called L143/L312/L424)
`autoPatchPujaBookingsSchema()` runs raw CREATE/ALTER SQL on a request when a column/table is missing. Masks schema drift, silently creates wrong columns; D1 has no transactions so partial patches can break DB. Contradicts agent.md rule #7. Delete function + call sites; fail loud and require `db:generate` → `db:local`/`db:remote`.

**3. In-memory rate limiter does not work across Workers isolates** (`server/utils/rate-limit.ts:L6`, L27-62)
Module-level `Map` tracks hits per isolate. Cloudflare runs many isolates; submitter can bypass the 5-per-10-min cap by hitting a different isolate. Map only grows. Move state to D1/KV or gate prod forms behind Turnstile alone.

**4. Same CMS content defined twice** (`app/composables/useTempleData.ts:L91-338` vs `server/cms/defaults.ts:L89-335`)
Near-identical ~330-line copies of hero/schedule/pujas/deities/festivals/notices/donation. Editing one does not update the other; client/server show different content; defaults drift silently. Single source of truth in `shared/` imported by both sides.

**5. Two API styles serve same resources** (`server/trpc/routers/` vs `server/api/cms/`, `server/api/forms/`)
Home CMS data served by tRPC (`routers/index.ts:L54-83`) and Nitro route (`/api/cms/home.get.ts`). Bookings exist in both `bookingsRouter` and `/api/forms/booking.post.ts`. Different error shapes (`TRPCError` vs `createApiError`), different validation. Pick one (tRPC preferred for end-to-end types) and remove duplicates.

**6. better-auth instance created per request** (`server/utils/auth.ts:L30-73`)
New `betterAuth()` object built inside `getAuth()` on every request (memoized only per event). better-auth is designed as a singleton; per-request creation adds overhead and can break cookie/session consistency. Create one instance at module load and reuse.

**7. Secrets read via `process.env`, not runtimeConfig** (`server/utils/auth.ts:L16-19`)
Reads `process.env.BETTER_AUTH_SECRET` directly. agent.md rule #15 requires `useRuntimeConfig(event)` with NUXT_-prefixed vars; `process.env` may not be populated in server context, so secret can be silently undefined at deploy. Route through `useRuntimeConfig`; fail if missing.

**8. No last-admin protection enforced in code** (`scripts/seed-admin.ts:L93`, only tested in `tests/auth.test.ts`)
`assertCanModifyAdmin()` prevents demoting/deleting last admin but is never called by any route/service. Admin can lock everyone out via API. Enforce in `adminProcedure` or admin update/delete service methods.

## Should fix

**9. `app.vue` holds 436 lines of inline CSS incl. dark-mode tokens** (`app/app.vue:L58-270`)
Dark palette in code does not match `COLOR_PALETTE.md` Palette B (code `#21262D` midnight vs doc `#14101F`). Extract CSS to dedicated asset file; align tokens with `COLOR_PALETTE.md`.

**10. Duplicate home page variants are dead/experimental code** (`app/pages/home-2.vue`, `home-fast.vue`, `useTempleDataFast.ts`, `HomeHeroFast.vue`, `HomeDeitiesFast.vue`)
Unclear which is canonical home. Extra components increase bundle + maintenance. Remove variants or flag as experimental/feature-flagged.

**11. CMS interfaces duplicated client/server** (`useTempleData.ts:L3-89` vs `cms/defaults.ts:L1-12`)
`HeroData`, `DailyEvent`, etc. redeclared though they exist in server defaults. Type drift when CMS shape changes. Move shared types to `shared/schemas/` or `shared/types/` and import both sides.

**12. Inconsistent error handling across layers** (`errors.ts`, `trpc/init.ts`, `services/bookings.ts:L283`, `services/pujas.ts:L119`)
Mix of `createApiError` (H3), `TRPCError`, raw `Error`, h3 `createError`. Callers can't rely on single error shape. Adopt one convention and wrap service errors at boundary.

**13. Phone-lookup does N+1 queries** (`services/bookings.ts:L154-197`)
`getByRefOrPhone()` finds rows by phone then calls `getByRef()` once per row. One query becomes 1+N. Fetch all needed columns in single query.

**14. `todos` demo router/table leftover code** (`routers/index.ts:L34-52`, `db/schema/content.ts:L3`)
Demo `todo` router against `todos` table with no real feature. Remove router block and table from schema/migrations.

## Nice to have

**15. `generateBookingRef` uses `Math.random()`** (`services/bookings.ts:L13-20`)
Reference codes `KM-2026-XXXXX` not cryptographically secure. Use `crypto.getRandomValues()` / `randomUUID()`. Low risk unless refs become security-relevant.

**16. Cache purge may not work under Cloudflare** (`utils/cache.ts:L9-10`)
`useStorage("cache")` Nitro abstraction may not behave as distributed cache across isolates under Cloudflare module preset. Verify under `wrangler dev` or switch to Cloudflare-native cache headers/API.

**17. Tests run against `:memory:` SQLite, not D1** (`tests/`)
D1-specific behavior (e.g. `onConflictDoNothing`, D1 error messages) not exercised. Add integration path against local D1 for critical writes.

**18. `seed.ts` uses `bun:sqlite` + `node:fs`** (`scripts/seed.ts:L1-4`)
Agent.md rule #2 forbids these in server runtime; seed.ts is a script (allowed) but fragile, relies on `.wrangler/state` internals. Document as dev-only; consider D1-based seed.

## Verdict

Not healthy yet — fix findings 1–8 (security and data-integrity) before any production deploy.

## Lean

About -400 lines possible by deduplicating CMS data (~330 lines into one shared file), removing `todos` demo router/table (~20 lines), deleting runtime auto-patch function (~45 lines). No dependency changes needed.

## Not checked

Not every Vue component (14 files), tRPC router (14 files), or test (21 files) read in full detail. Could not run `bun run test` or `bun run typecheck` (sandbox blocks them). R2 media binding disabled in `wrangler.jsonc` (documented), so media behavior in production not verified.