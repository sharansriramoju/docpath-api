# CLAUDE.md — Docpath API

## What is this?

Healthcare clinic management REST API (Node.js / Express 5 / Sequelize 6 / PostgreSQL).
Single-tenant. Cookie-based auth (JWT in `token` cookie + express-session backed by Redis).

## Commands

```bash
npm start          # runs nodemon (dev server)
npm run build      # tsc compile
npm run migration:create  # scaffolds a new Umzug migration file
```

No test suite yet (`npm test` is a placeholder).

## Project structure

```
src/
  config/           # constants (PATIENT_ROLE_ID, etc.)
  controller/       # Express route handlers (thin — delegate to services)
  database/
    models/         # Sequelize models + index.ts (associations)
    repositories/   # Raw DB queries (Sequelize or raw SQL)
    seeders/        # Umzug-managed seeders (migration-style, name-tracked)
    redis.ts        # ioredis client
    sequelize.ts    # Sequelize instance
  errors/           # ApiError class
  helpers/          # PII encryption, blind-index helpers
  middlewares/      # auth, validation, rate limiting, asyncHandler
  authorization/    # CASL defineAbility
  routes/           # Express routers
  services/         # Business logic layer
  validations/      # Zod schemas
  scripts/          # One-off scripts (e.g. backfill-name-search-index)
```

## Coding conventions

- **snake_case** for local variables, params, and object/response keys
- **camelCase** for function names
- **Filenames**: unchanged from original (e.g. `defineAbility.ts`, `ApiError.ts`)
- **Validation exports**: use `*Schema` suffix (not `*Validation`)
- **Validation middlewares**: `validate(schema)` for body, `validateQuery(schema)` for query, `validateParams(schema)` for params
- **Error class**: `ApiError` with `status_code` and `is_operational`
- **List response shape**: All list/paginated endpoints return `{ rows: [], count: N }` inside `data` — no extra pagination fields

## Auth & authorization

- JWT extracted from `req.cookies["token"]` via Passport
- Session data on `req.session.user` (includes role, permissions, locations, reporting_doctors)
- `req.session.ability` holds the CASL ability built by `defineAbilityFor(req.session.user)`
- `isDoctor` middleware: gates routes to users whose `role.name` contains "doctor" (case-insensitive)
- CASL permissions have scope `ALL` (unrestricted) or `LIMITED` (scoped to user's locations/reporting doctors)

### Session user shape (relevant fields)

```
req.session.user.user_id
req.session.user.role.name
req.session.user.locations[]         // NOT user_locations
req.session.user.reporting_doctors[] // { doctor_id }
req.session.user.permissions[]       // { action, subject, RolePermission: { scope, conditions } }
```

## PII encryption

All PII fields (name, phone, email, gender, date_of_birth, profile_image_url) are encrypted at rest with AES-256-GCM.

- **Encrypt**: `encryptPII(plaintext)` → base64 payload (iv + authTag + ciphertext)
- **Decrypt**: `decryptPII(payload)` → plaintext
- **Exact lookup**: `hashForLookup(value)` — HMAC-SHA256 blind index (full 32 bytes), used for phone/email search
- **Substring search**: Trigram blind index on name fields
  - `buildNameSearchIndex(name)` → `string[]` of truncated (16 hex char) HMAC hashes of trigrams
  - `hashNameSearchTerms(query)` → matching hashes for search queries
  - Stored in `name_search_index TEXT[]` column with GIN index
  - Minimum query length: 3 chars (trigram size)

**Env vars**: `PII_ENC_KEY` (base64, 32 bytes), `PII_LOOKUP_KEY` (base64, different key)

## File uploads (S3)

`uploadFileToS3(file, folder?)` in `src/helpers/index.helper.ts` uploads a Multer file to AWS S3 and returns `{ url, key }`. The key is prefixed with the optional `folder` and timestamped to avoid collisions.

**Env vars**: `S3_BUCKET_NAME`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`

## Key domain rules

- **Patients**: Users with `role_id = PATIENT_ROLE_ID` (env var, default 3). Users and Patients are separate API modules — Users endpoints exclude patients, Patients endpoints force `role_id = PATIENT_ROLE_ID`.
- **Appointments**: Always for a doctor (role name must contain "doctor"). Conflict check uses half-open interval (`start < end AND end > start`). Past appointments rejected via IST timezone check on both start_time and end_time.
- **Overview API**: Returns per-day, per-location, per-doctor counts for a single doctor. Empty days filled with `totals: []` for week/month views.
- **Doctor notes/prescription**: Only users with a doctor role can read/write (gated by `isDoctor` middleware).
- **Reschedule/Cancel**: Allowed by the appointment's doctor or their reporting staff (CASL doctor_id condition).

## Rate limiting

Redis-backed sliding-window rate limiter (`src/middlewares/rateLimit.middleware.ts`).

| Limiter | Window | Max | Key | Fail mode |
|---------|--------|-----|-----|-----------|
| `apiRateLimiter` | 1 min | 100 | IP | fail-open |
| `sendOtpRateLimiter` | 15 min | 5 | phone | fail-closed |
| `verifyOtpRateLimiter` | 15 min | 10 | phone | fail-closed |

## Seeders (Umzug)

Seeders are name-tracked like migrations. Editing an already-run seeder has no effect — create a new one with a bumped number (e.g. `0003` → `0004`).

Current seeders: `0001-roles`, `0002-locations`, `0004-roles-permissions`

## API modules

| Module | Route prefix | Key operations |
|--------|-------------|----------------|
| Authentication | `/authentication` | OTP send/verify, login/logout |
| Users | `/users` | CRUD (excludes patients), search by role_name/phone/email/name |
| Patients | `/patients` | CRUD (role_id forced to PATIENT_ROLE_ID), search by phone/email/name |
| Appointments | `/appointments` | Create, list, overview, notes, reschedule, cancel |
| Roles | `/roles` | CRUD with permission mapping (add/edit/remove permissions) |
| Locations | `/locations` | CRUD |
| Doctor Routine | `/doctor-routine` | CRUD |

## Important gotchas

- `Appointment.date` is `DATEONLY` / type `string` — do NOT wrap in `new Date()` (timezone off-by-one risk)
- `defineAbility.ts`: Use spread syntax for array building, not `.push()` (push returns length, not the array)
- Session user has `locations` (not `user_locations`) and `reporting_doctors` arrays
- `created_at` uses `CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'` (IST)
- User update uses delta-style: `add_location_ids`/`remove_location_ids`, `add_reporting_doctor_ids`/`remove_reporting_doctor_ids`
- Roles update uses delta-style: `add_permissions`/`edit_permissions`/`remove_permissions`
