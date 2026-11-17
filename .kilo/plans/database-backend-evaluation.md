# Database & Backend Evaluation — temple-cf

Saved 2026-11-17. Covers all 16 DB tables, 14 services, 14 tRPC routers, 8+ Nitro API routes, auth, media, caching, audit, retention, migrations.

---

## 1. Database Schema — Design Review

**Tables (16):**
| Table | Purpose | Notes |
|-------|---------|-------|
| `user` | Auth accounts (better-auth) | id PK, email unique, role enum, timestamps |
| `session` | Auth sessions | token unique, userId FK cascade |
| `account` | OAuth/link accounts | userId FK cascade |
| `verification` | Email verification | identifier/value/expires |
| `home_cms` (`site_content`) | Key/value CMS store | key PK, JSON data blob |
| `todos` | Demo/leftover | No feature uses it |
| `pujas` | Puja offerings | slug unique, JSON localized fields, price integer BDT |
| `puja_bookings` | Booking requests | ref unique, userId/pujaId FKs set-null, status enum |
| `daily_schedule` | Temple aarti times | time HH:mm, sortOrder |
| `events` | Special pujas + festivals | slug unique, date YYYY-MM-DD, kind enum |
| `notices` | Temple notices | slug unique, pinned flag, category |
| `pages` | Static pages | slug unique, published flag |
| `albums` / `album_items` | Gallery | cover/mediaId references, cascade on album delete |
| `media` | R2 media metadata | key unique, mime/size/width/height, uploadedBy FK |
| `audit_logs` | Admin audit trail | action/entity/entityId, JSON details, timestamp ms |
| `visitations` | Darshan pass bookings | ref unique, timeSlot/purpose/status enums |

**Strengths:**
- Consistent naming: snake_case columns, `createdAt`/`updatedAt` on every table
- Proper indexes on slug, ref, status, date, userId, sortOrder
- Foreign keys with `ON DELETE SET NULL` / `CASCADE` where appropriate
- Enums for status, role, kind, timeSlot, purpose — data integrity at DB level
- Integer BDT prices (avoids float rounding)
- Unix millisecond timestamps (consistent within most tables)

**Weaknesses / Risks:**

**DB-1. No `PRAGMA foreign_keys = ON`** — SQLite/D1 does not enforce foreign key constraints by default. Orphaned rows can be created if app code doesn't handle referential integrity manually. D1 specifically requires the pragma per connection; drizzle-orm/d1 does not enable it automatically.

**DB-2. Inconsistent timestamp types** — Most tables store `createdAt`/`updatedAt` as integer (Unix ms via `Date.now()`), but `home_cms.updatedAt` and auth schema use `text` ISO strings. The `retention.ts` cutoff compares against `Date.now()` (ms) but `createdAt` could be a string in some tables, causing silent comparison failures.

**DB-3. No soft deletes** — All deletes are hard deletes. No `deletedAt` column. Once a booking, notice, or media row is deleted, it is gone except via D1 time-travel (30-day Cloudflare feature) or backups.

**DB-4. `todos` table + router is dead code** — `server/db/schema/content.ts` and `server/trpc/routers/index.ts` (lines 34-52) define a todo feature that nothing uses.

**DB-5. No unique constraint preventing duplicate bookings** — A devotee could submit the same puja booking multiple times for the same phone/date. No unique index on `(phone, preferredDate)` or `(userId, pujaId, preferredDate)`.

**DB-6. `visitations` missing from retention purge** — `RetentionService.purgeOldRecords` purges messages, bookings, volunteers but not `visitations`, which also contains PII (name, phone, email). Contradicts the 365-day retention policy in `md/BACKEND_OPERATIONS.md`.

**DB-7. JSON string columns without validation** — Localized fields (`name`, `description`, `body`, `title`) are stored as JSON strings in TEXT columns. Drizzle doesn't validate JSON shape at the DB level; a bad insert can store malformed JSON that crashes `JSON.parse()` on read (e.g., `MediaService.listMedia` does `JSON.parse(item.alt)` without try/catch).

**DB-8. `media.alt` parsed without error handling** — `MediaService.listMedia` (L51-54) and `getMediaById` (L61-67) call `JSON.parse(item.alt)` directly. If any row has non-JSON `alt`, the entire list endpoint crashes.

---

## 2. Database Access Patterns

**Connection:** `server/db/index.ts` creates a Drizzle D1 instance per request from `event.context.cloudflare.env.DB`. Correct per agent.md rule #3/4. However, `server/utils/auth.ts` also calls `getDb(event)` separately, creating a second Drizzle instance per request for auth. Wasteful but not incorrect.

**Query style:** Services use `db.select().from().where().limit().offset()` with `sql.raw()` for count. Pattern is consistent and correct.

**Pagination:** All list methods use `page`/`pageSize` with `Math.min(pageSize, 100)` cap. Good. However, `ScheduleService.list` computes count before applying offset (line 57-62) while others compute both in parallel via `Promise.all`. Minor inconsistency, no bug.

**N+1 queries:**
- `BookingsService.getByRefOrPhone()` (`server/services/bookings.ts:L154-197`): finds rows by phone, then calls `getByRef()` once per row to re-fetch each booking. 1+N queries. Should select all columns once.
- `GalleryService.getPublicAlbumWithItems()` (`server/services/gallery.ts:L241-261`): 2 queries (album + items). Acceptable for gallery scale, but could be a join.

**Auto-patching (dangerous):**
- `BookingsService.autoPatchPujaBookingsSchema()` (`server/services/bookings.ts:L31-75`) — runs raw CREATE TABLE/ALTER TABLE on error.
- `VisitationsService.autoPatchVisitationsSchema()` (`server/services/visitations.ts:L22-59`) — same pattern.
Both mask migration drift, can create wrong columns, and D1 has no transactions so partial patches leave DB broken. Contradicts agent.md rule #7.

**No `db.batch()` usage** — agent.md rule #5 says use `db.batch()` for atomic multi-statement writes (D1 has no interactive transactions). `RetentionService.purgeOldRecords()` does 3 sequential deletes without batching. `GalleryService.deleteAlbum()` does 2 sequential deletes. `BookingsService.createBookingRequest()` does insert + audit implicitly across services. None use `db.batch()`. Risk of partial writes on failure.

---

## 3. Backend Services — Review

**14 services:** bookings, pujas, events, notices, deities, schedule, pages, gallery, media, messages, volunteers, visitations, audit, retention.

**Patterns:** Each service is a class with `static async` methods, takes `db` as first argument, uses `createError()` from h3 for HTTP errors, calls `purgeCache()` and `AuditService.record()` on mutations (when applicable). Consistent and testable (services don't depend on H3 event).

**Issues:**

**SVC-1. Error handling inconsistency** — Some services throw h3 `createError` (bookings, pujas, events, notices, deities, schedule, media), some throw raw `Error` (gallery, pages, messages, volunteers). Raw `Error` has no `statusCode`, so API routes can't map it to HTTP status reliably. Callers must wrap or guess.

**SVC-2. `parseJson()` duplicated in every service file** — `bookings.ts`, `pujas.ts`, `events.ts`, `notices.ts`, `deities.ts`, `gallery.ts`, `schedule.ts`, `pages.ts`, `media.ts` all define a local `parseJson` helper. ~9 copies of the same 5-line function. Should be one shared util in `shared/` or `server/utils/`.

**SVC-3. `purgeCache()` failure is silently swallowed** — Every service calls `await purgeCache([...]).catch((err) => console.warn(...))`. If cache purge fails, stale content may be served. No retry, no alerting.

**SVC-4. Audit logging failure is silently swallowed** — Same `.catch((err) => console.warn("Audit record error:", err))` pattern. If audit write fails, admin actions are untraceable. For security-critical actions, audit failure should not be silent.

**SVC-5. `MediaService.deleteMedia()` is not atomic** — Deletes from R2 bucket, then deletes DB row. If R2 delete succeeds but DB delete fails (or vice versa), media metadata and object are out of sync. D1 has no transactions, so this cannot be fully atomic. Should document or compensate.

**SVC-6. `BookingsService.createBookingRequest()` reference collision retry is weak** — 3 retries with `Math.random()` 5-char codes (~900M space). Under high concurrency, collisions are possible and the loop may exhaust retries. No exponential backoff.

**SVC-7. `ScheduleService.computeNextAarti()` uses string comparison for times** — `a.time.localeCompare(b.time)` works for HH:mm 24-hour format, but `item.time > currentHhmm!` is lexicographic string comparison. Works for zero-padded HH:mm but fragile if time format varies. Schema enforces `hhmm` regex at validation level, but DB column is unconstrained TEXT.

**SVC-8. `getDhakaDate()` / `computeNextAarti()` timezone handling** — Uses `Intl.DateTimeFormat` with `Asia/Dhaka`. Correct for display, but `ScheduleService.getStats()` defaults to `new Date().toISOString().slice(0,10)` which is UTC date, not Dhaka date. A visitor at 10pm UTC may see tomorrow's Dhaka date stats.

---

## 4. API Routes — Nitro + tRPC

**Two parallel API styles:**

**tRPC** (`server/api/trpc/[trpc].ts`): 14 routers, all admin mutations protected by `staffProcedure`/`adminProcedure`. Public reads (pujas, deities, events, notices) are NOT exposed via tRPC — they are `staffProcedure` only. This means the public frontend cannot fetch public data via tRPC without auth.

**Nitro routes** (`server/api/`):
- `/api/cms/home.get.ts` — public, cached, serves home CMS data (duplicates tRPC `cms.getHomeData`)
- `/api/cms/home.post.ts`, `/api/cms/about.post.ts`, etc. — admin CMS writes
- `/api/forms/booking.post.ts` — public booking with rate limit + Turnstile
- `/api/forms/contact.post.ts`, `visitation.post.ts`, `volunteer.post.ts` — public forms
- `/api/auth/[...all].ts` — better-auth handler
- `/api/admin/media.post.ts` — media upload
- `/api/media/[...key].get.ts` — media download
- `/api/public/*` — public read endpoints for deities, pujas, events, notices, pages, schedule, gallery, visitations, bookings
- `/api/me/bookings/`, `/api/me/visitations/` — user-scoped
- `/api/health.get.ts` — health check
- `/api/admin/` — admin routes

**Issues:**

**API-1. Duplicate API surface** — Home CMS data served by both tRPC (`cms.getHomeData`) and Nitro (`/api/cms/home.get.ts`). Bookings exist in both `bookingsRouter` (tRPC) and `/api/forms/booking.post.ts` (Nitro). Different error shapes (`TRPCError` vs `createApiError`), different validation layers. Bug fixes may land in one path only.

**API-2. Public reads require staff role in tRPC** — `pujasRouter.list`, `deitiesRouter.list`, `eventsRouter.list`, `noticesRouter.list` are all `staffProcedure`. The public site must use Nitro `/api/public/*` routes instead. This splits the public data access path from the typed tRPC path.

**API-3. `/api/public/*` routes not reviewed** — Directory exists (`server/api/public/albums/`, `bookings/`, `deities/`, etc.) but contents were not fully read in this evaluation. Potential inconsistency with tRPC routers.

**API-4. Turnstile bypass in dev/test** — `server/utils/turnstile.ts:L20-31` returns `true` when `import.meta.dev`, no secret configured, or token starts with "dummy"/"mock". In production, if `TURNSTILE_SECRET` is unset, verification is silently skipped. Should fail closed (require secret in prod).

**API-5. `verifyTurnstile` uses `process.env` not runtimeConfig** — Same issue as auth secret (agent.md rule #15).

**API-6. Health check** — `md/BACKEND_OPERATIONS.md` describes `/api/health` with `SELECT 1` probe. Route file `server/api/health.get.ts` exists but was not read in detail.

---

## 5. Authentication & Session

**better-auth** with Drizzle adapter (D1). Schema: `user`, `session`, `account`, `verification`.

**Issues:**

**AUTH-1. Hardcoded default secret** — `server/utils/auth.ts:L19`: `"temple-default-dev-secret-change-in-prod-min-32-chars"` fallback. Critical security issue if deployed without `BETTER_AUTH_SECRET`.

**AUTH-2. Per-request auth instance** — `getAuth()` creates a new `betterAuth()` object per request. better-auth is designed as a singleton. Per-request creation can break cookie/session consistency and adds overhead.

**AUTH-3. Secrets via `process.env`** — Reads `process.env.BETTER_AUTH_SECRET` directly instead of `useRuntimeConfig(event)`. May be undefined in server context at deploy.

**AUTH-4. No last-admin enforcement in API** — `assertCanModifyAdmin()` exists in `scripts/seed-admin.ts` and is tested, but never called by any route/service. An admin can demote/delete themselves and lock everyone out.

**AUTH-5. Role is server-controlled (`input: false`)** — Good. Client cannot set role at signup.

**AUTH-6. Public signup gate** — `ALLOW_PUBLIC_SIGNUP` env gate enforced in `before` hook. Default false. Good.

---

## 6. Media / R2

**Schema:** `media` table with `key` (unique, random), `mime`, `size`, `width`, `height`, `alt` (JSON), `uploadedBy` FK.

**Binding:** R2 bucket `MEDIA` is commented out in `wrangler.jsonc` (R2 not enabled in Cloudflare account). Media upload route exists (`/api/admin/media.post.ts`) but cannot work until R2 is enabled.

**Issues:**

**MEDIA-1. `media.alt` parsed without try/catch** — See DB-8.

**MEDIA-2. Delete is not atomic** — R2 object delete + DB row delete are separate operations. If one fails, orphaned R2 object or orphaned DB row remains.

**MEDIA-3. Reference check uses `LIKE %key%`** — `checkMediaReferences()` matches `imageId`/`cover`/`mediaId` against both numeric ID string and key pattern. `LIKE` with leading wildcard cannot use indexes; slow on large tables. Acceptable for small gallery scale.

**MEDIA-4. No image processing/optimization** — Images stored as-is in R2. No resize, WebP conversion, or CDN caching beyond `Cache-Control: immutable`.

---

## 7. Forms & Validation

**Shared schemas:** `forms.ts` (booking, contact, volunteer), `visitations.ts` (darshan pass). All use Zod with `bdPhone` regex, honeypot, Turnstile token, `stripHtml` transforms.

**Strengths:**
- Bangladesh phone validation (`^(\+?880|0)?1[3-9]\d{8}$`)
- Honeypot field on every public form
- Turnstile token required
- HTML stripping on text inputs
- Custom puja requires `customPujaName`

**Issues:**

**FORM-1. Visitation creation has no rate limiting** — `server/api/forms/visitation.post.ts` (if it exists) or tRPC `createVisitation` does not call `enforceRateLimit()`. Booking and contact forms do; visitation does not.

**FORM-2. Visitation creation does not verify Turnstile** — `VisitationsService.createVisitation()` accepts input directly with no Turnstile verification. Unlike booking/contact forms which call `verifyTurnstile()` in the API route.

**FORM-3. `enforceRateLimit()` is in-memory** — Per-isolate Map (see risk #3 in prior audit). Does not work across Cloudflare Workers isolates.

---

## 8. Caching

**`server/utils/cache.ts`** — `purgeCache(tags[])` uses `useStorage("cache")` (Nitro storage abstraction).

**Issues:**

**CACHE-1. `useStorage("cache")` may not work across Cloudflare isolates** — Under the `cloudflare_module` preset, Nitro's cache storage may be per-isolate or may not support `getKeys()`. Cache purge may not actually invalidate cached responses in production. Needs verification under `wrangler dev`.

**CACHE-2. No cache tagging on reads** — Public endpoints set `Cache-Control` headers but don't tag cached entries. Purge by tag prefix matching is best-effort.

**CACHE-3. `purgeCache` failures swallowed** — See SVC-3.

---

## 9. Audit & Retention

**Audit:** `audit_logs` table with action/entity/entityId/details/at. Services call `AuditService.record()` on create/update/delete. Audit failures silently swallowed.

**Retention:** `RetentionService.purgeOldRecords()` deletes old messages/bookings/volunteers older than 365 days, then writes audit log. Missing: `visitations` purge (PII). No cron trigger configured in `wrangler.jsonc` (documented as optional).

**Issues:**

**RET-1. `visitations` not in retention** — PII retention gap.
**RET-2. Purge is not atomic** — 3 sequential deletes without `db.batch()`. Partial purge possible on failure.
**RET-3. Audit record after purge could fail** — If audit write fails after data is deleted, there's no record of the purge. Should be batched with the deletes if possible.

---

## 10. Migrations

**`drizzle/`** — 14 numbered migrations (`0000` through `0013`) plus `meta/`. Migration files are Drizzle-generated SQL. `sql/0013_fix_patch.sql` is a manual patch.

**Issues:**

**MIG-1. Manual patch SQL coexists with Drizzle migrations** — `sql/0013_fix_patch.sql` applied via `db:patch:remote`. Mix of generated and manual migrations increases drift risk.

**MIG-2. `db:generate` workflow not enforced** — agent.md rule #7 says schema changes go through Drizzle migrations, but `autoPatchPujaBookingsSchema()` and `autoPatchVisitationsSchema()` bypass this entirely at runtime.

---

## 11. Overall Database/Backend Scorecard

| Area | Grade | Key Issues |
|------|-------|------------|
| Schema design | B | Good structure, no FK enforcement, inconsistent timestamps |
| Query patterns | B+ | Consistent, but N+1 in phone lookup, no `db.batch()` |
| Migrations | C | Runtime auto-patching bypasses migrations |
| Auth | D | Hardcoded default secret, per-request instance, `process.env` |
| Validation | B+ | Strong Zod schemas, honeypot, phone regex |
| Rate limiting | C | In-memory, per-isolate, missing on visitation |
| Caching | C | Unverified under Cloudflare, failures swallowed |
| Audit | B | Good coverage, failures silently swallowed |
| Retention | C | Missing visitations, not atomic |
| Media | C | R2 disabled, non-atomic delete, unsafe JSON parse |
| API duplication | C | tRPC + Nitro parallel paths |

---

## Top Recommendations (Database/Backend)

1. **Remove hardcoded auth secret** — fail if `BETTER_AUTH_SECRET` missing in production.
2. **Delete runtime auto-patch functions** — `autoPatchPujaBookingsSchema()` and `autoPatchVisitationsSchema()`. Fail loud on missing columns; require `db:generate` → `db:local`/`db:remote`.
3. **Enable `PRAGMA foreign_keys = ON`** per D1 connection, or handle referential integrity in app code.
4. **Unify timestamp type** — all `createdAt`/`updatedAt` as integer Unix ms.
5. **Use `db.batch()`** for multi-statement writes (retention purge, gallery delete, booking + audit).
6. **Deduplicate `parseJson()`** into one shared utility.
7. **Fix N+1 in `getByRefOrPhone()`** — single query with all columns.
8. **Add `visitations` to retention purge.**
9. **Add rate limiting + Turnstile to visitation creation.**
10. **Fail closed on Turnstile when secret missing in production.**
11. **Remove `todos` demo table and router.**
12. **Add `deletedAt` soft delete** or document hard-delete policy.
