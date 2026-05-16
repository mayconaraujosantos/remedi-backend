# Design Document — api-missing-features

## Overview

This document describes the technical design for the missing features identified in the gap analysis between the current `reminder-api` implementation and the target OpenAPI specification (`reminder-api.yml`).

The API is a Node.js/TypeScript REST service built with Fastify, Drizzle ORM (PostgreSQL), tsyringe (DI), Zod (validation), and follows Clean Architecture (domain → application → infra layers). OpenTelemetry provides distributed tracing and metrics; BullMQ handles background job queues.

The features to be implemented are grouped into six areas:

1. **Authentication & Session** — Registration, Login, Token Refresh, Logout, JWT Middleware
2. **User Profile & Devices** — GET/PATCH /me, Push Notification Device Management
3. **Dose Events** — Listing with filters/pagination, Single retrieval, Snooze, Batch actions, Extended status values
4. **Adherence** — Summary, History, Report Export (CSV/PDF)
5. **Health Check** — Liveness endpoint
6. **Caregivers & Webhooks** — Invitation flow, Caregiver management, Notification delivery webhook

---

## Architecture

The project follows Clean Architecture with three layers:

```
domain/          ← Entities, value objects, repository interfaces, domain errors
application/     ← Use cases, services, DTOs, mappers, presenters, providers
infra/           ← Drizzle repositories, Fastify controllers/routes/validators, BullMQ
main/            ← DI container, server bootstrap, config
shared/          ← AppError, logger, tracing, metrics utilities
```

All new features follow the same layering pattern already established in the codebase:

- **Domain entities** define the core model and business rules (no framework dependencies).
- **Use cases** orchestrate domain objects and call repository interfaces.
- **Application services** compose use cases and are injected into controllers.
- **Infra repositories** implement domain repository interfaces using Drizzle ORM.
- **Infra controllers** receive validated HTTP input and delegate to services.
- **Infra routes** register Fastify routes with Zod schemas for request/response validation.
- **DI container** (`src/main/container/container.ts`) wires everything together with tsyringe.

### New Modules Overview

```
domain/
  entities/       User, UserDevice, Prescription, DoseEvent (extended), CaregiverLink, Invite
  repositories/   UserRepository, UserDeviceRepository, PrescriptionRepository,
                  DoseEventRepository (extended), CaregiverRepository, InviteRepository
  errors/         ConflictError, UnauthorizedError, ForbiddenError, NotFoundError (new)

application/
  usecases/       RegisterUser, LoginUser, RefreshToken, LogoutUser,
                  GetUserProfile, UpdateUserProfile,
                  RegisterDevice, ListDevices, RemoveDevice,
                  ListDoseEvents, GetDoseEvent, SnoozeDoseEvent, BatchDoseActions,
                  GetAdherenceSummary, GetAdherenceHistory, ExportAdherenceReport,
                  InviteCaregiver, AcceptCaregiverInvite, ListCaregivers, RemoveCaregiver,
                  ProcessNotificationWebhook
  services/       AuthService, UserService, DeviceService, DoseEventService (extended),
                  AdherenceService, CaregiverService, WebhookService
  dto/            (new DTOs for each feature area)
  mappers/        UserMapper, DeviceMapper, PrescriptionMapper, AdherenceMapper, CaregiverMapper

infra/
  db/
    schema/       users, refresh_tokens, user_devices, prescriptions, dose_events (extended),
                  caregiver_links, caregiver_invites, notification_deliveries
    repositories/ UserRepositoryDrizzle, UserDeviceRepositoryDrizzle,
                  PrescriptionRepositoryDrizzle, DoseEventRepositoryDrizzle (extended),
                  CaregiverRepositoryDrizzle, InviteRepositoryDrizzle
  http/
    middleware/   JwtAuthMiddleware
    controllers/  AuthController, UserController, DeviceController,
                  DoseEventController (extended), AdherenceController,
                  CaregiverController, WebhookController, HealthController
    routes/       AuthRoutes, UserRoutes, DeviceRoutes, DoseEventRoutes (extended),
                  AdherenceRoutes, CaregiverRoutes, WebhookRoutes, HealthRoutes
    validators/   (Zod schemas per route)
```

### Request Flow

```
HTTP Request
  → Fastify Route (Zod validation)
  → JWT Middleware (protected routes)
  → Controller
  → Application Service
  → Use Case(s)
  → Domain Entity / Repository Interface
  → Drizzle Repository (PostgreSQL)
```

---

## Components and Interfaces

### 1. Authentication & Session

#### JWT Middleware

A Fastify `preHandler` hook registered on all protected routes. It reads the `Authorization: Bearer <token>` header, verifies the JWT signature and expiry using the `jsonwebtoken` library, and attaches the decoded user identity to `request.user`.

Public routes (no middleware): `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /health`, `POST /caregivers/invite/:inviteId/accept`.

```typescript
// src/infra/http/middleware/JwtAuthMiddleware.ts
export async function jwtAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void>
```

#### AuthService

```typescript
interface AuthService {
  register(dto: RegisterUserDTO): Promise<AuthTokensDTO>
  login(dto: LoginUserDTO): Promise<AuthTokensDTO>
  refresh(refreshToken: string): Promise<AuthTokensDTO>
  logout(userId: string): Promise<void>
}
```

Passwords are hashed with `bcrypt` (cost factor 12). Refresh tokens are opaque UUIDs stored in the `refresh_tokens` table with an `expiresAt` timestamp (30 days). Access tokens are JWTs signed with `HS256`, expiring in 1 hour.

### 2. User Profile & Devices

#### UserService

```typescript
interface UserService {
  getProfile(userId: string): Promise<UserProfileDTO>
  updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserProfileDTO>
}
```

#### DeviceService

```typescript
interface DeviceService {
  register(userId: string, dto: RegisterDeviceDTO): Promise<UserDeviceDTO>
  list(userId: string): Promise<UserDeviceDTO[]>
  remove(userId: string, deviceId: string): Promise<void>
}
```

### 3. Dose Events (Extended)

The existing `DoseEventRepository` is extended with new query methods:

```typescript
interface DoseEventRepository {
  // existing
  create(event: DoseEvent): Promise<void>
  update(event: DoseEvent): Promise<void>
  findById(id: string): Promise<DoseEvent | null>
  findByMedicationId(medicationId: string, startDate?: Date, endDate?: Date): Promise<DoseEvent[]>
  listPending(): Promise<DoseEvent[]>
  // new
  findByUserId(userId: string, filters: DoseEventFilters): Promise<PaginatedResult<DoseEvent>>
  findByUserIdAndId(userId: string, id: string): Promise<DoseEvent | null>
  countByUserId(userId: string, filters: DoseEventFilters): Promise<number>
}

interface DoseEventFilters {
  from: Date
  to: Date
  status?: DoseStatus
  prescriptionId?: string
  page: number
  perPage: number
}
```

#### DoseEventService (extended)

```typescript
interface DoseEventService {
  list(userId: string, filters: DoseEventFilters): Promise<PaginatedResult<DoseEventDTO>>
  getById(userId: string, id: string): Promise<DoseEventDTO>
  snooze(userId: string, id: string, minutes: number): Promise<DoseEventDTO>
  batchAction(userId: string, events: BatchEventItem[]): Promise<BatchResultDTO>
}
```

### 4. Adherence

#### AdherenceService

```typescript
interface AdherenceService {
  getSummary(userId: string, query: AdherenceQuery): Promise<AdherenceSummaryDTO>
  getHistory(userId: string, query: AdherenceQuery): Promise<PaginatedResult<AdherenceLogDTO>>
  exportReport(userId: string, query: AdherenceExportQuery): Promise<ExportResult>
}

interface AdherenceQuery {
  from: Date
  to: Date
  prescriptionId?: string
  page?: number
  perPage?: number
}

interface AdherenceExportQuery {
  from: Date
  to: Date
  format: 'csv' | 'pdf'
}
```

The `adherenceRate` is computed as `took / (took + skipped + missed)`, rounded to 4 decimal places. When the denominator is zero, `adherenceRate` is `0`.

CSV export uses the `csv-stringify` library. PDF export uses `pdfkit`.

### 5. Health Check

```typescript
interface HealthController {
  check(request: FastifyRequest, reply: FastifyReply): Promise<void>
}
```

The health check probes the PostgreSQL connection (via a `SELECT 1` query) and the Redis connection (via a `PING` command). It returns `{ status: 'ok' | 'degraded', checks: { db: 'ok' | 'error', redis: 'ok' | 'error' } }`. HTTP 200 if all checks pass, HTTP 503 if any check fails.

### 6. Caregivers

#### CaregiverService

```typescript
interface CaregiverService {
  invite(userId: string, dto: InviteCaregiverDTO): Promise<CaregiverInviteDTO>
  acceptInvite(inviteId: string, dto: AcceptInviteDTO): Promise<CaregiverLinkDTO>
  list(userId: string): Promise<CaregiverLinkDTO[]>
  remove(userId: string, caregiverId: string): Promise<void>
}
```

Invites expire 7 days after creation. The `expiresAt` field is set to `createdAt + 7 * 24 * 60 * 60 * 1000` at creation time.

### 7. Notification Delivery Webhook

#### WebhookService

```typescript
interface WebhookService {
  processNotificationDelivery(
    payload: NotificationDeliveryPayload,
    signature: string
  ): Promise<void>
}
```

HMAC-SHA256 signature validation: the webhook endpoint reads the `X-Webhook-Signature` header and compares it against `HMAC-SHA256(secret, rawBody)`. The secret is stored in the `WEBHOOK_SECRET` environment variable.

### Shared Pagination Envelope

All paginated endpoints return:

```typescript
interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}
```

---

## Data Models

### New Database Tables (Drizzle schema additions)

```typescript
// users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone'),
  timezone: text('timezone').notNull().default('UTC'),
  locale: text('locale').notNull().default('en'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// refresh_tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// user_devices
export const userDevices = pgTable('user_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(), // 'ios' | 'android'
  pushToken: text('push_token').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// prescriptions (replaces/extends medications for the new domain model)
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customMedicationName: text('custom_medication_name').notNull(),
  doseAmount: numeric('dose_amount').notNull(),
  doseUnit: text('dose_unit').notNull(),
  instructions: text('instructions'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// dose_events (extended — adds userId, prescriptionId, new status values, new timestamp fields)
export const doseEventsV2 = pgTable('dose_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  prescriptionId: uuid('prescription_id').notNull().references(() => prescriptions.id),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: text('status').notNull().default('PENDING'),
  takenAt: timestamp('taken_at'),
  skippedAt: timestamp('skipped_at'),
  notifiedAt: timestamp('notified_at'),
  snoozedTo: timestamp('snoozed_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// caregiver_invites
export const caregiverInvites = pgTable('caregiver_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => users.id),
  inviteeEmail: text('invitee_email').notNull(),
  inviteeFullName: text('invitee_full_name').notNull(),
  permission: text('permission').notNull().default('view'), // 'view' | 'manage'
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'expired'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// caregiver_links
export const caregiverLinks = pgTable('caregiver_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => users.id),
  caregiverId: uuid('caregiver_id').notNull().references(() => users.id),
  permission: text('permission').notNull().default('view'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// notification_deliveries
export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  doseEventId: uuid('dose_event_id').notNull().references(() => doseEventsV2.id),
  deliveryStatus: text('delivery_status').notNull(),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

### Extended Domain Entities

#### User

```typescript
export type UserProps = {
  id?: string
  fullName: string
  email: string
  passwordHash: string
  phone?: string
  timezone: string
  locale: string
  createdAt: Date
  updatedAt: Date
}

export class User {
  // properties + updateProfile(dto) method
}
```

#### DoseEvent (extended)

```typescript
export type DoseStatus =
  | 'PENDING'
  | 'NOTIFIED'
  | 'TAKEN'
  | 'SKIPPED'
  | 'MISSED'
  | 'SNOOZED'

export class DoseEvent {
  // existing fields +
  public readonly userId: string
  public readonly prescriptionId: string
  public notifiedAt?: Date
  public snoozedTo?: Date

  public markAsNotified(date?: Date): void
  public snooze(minutes: number, now?: Date): void
  // existing: markAsTaken, markAsSkipped, markAsMissed
}
```

Valid status transitions:

```
PENDING    → NOTIFIED, TAKEN, SKIPPED, MISSED, SNOOZED
NOTIFIED   → TAKEN, SKIPPED, MISSED, SNOOZED
SNOOZED    → TAKEN, SKIPPED, MISSED, NOTIFIED
TAKEN      → (terminal)
SKIPPED    → (terminal)
MISSED     → (terminal)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The following properties were derived from the acceptance criteria prework analysis. Properties that were logically redundant or covered by a more general property have been consolidated.

---

### Property 1: Input validation rejects any body with a missing required field

*For any* registration or login request body where one or more required fields are absent or malformed, the API SHALL return HTTP 400.

**Validates: Requirements 1.3, 2.3**

---

### Property 2: Invalid credentials always return 401

*For any* login attempt using an email/password combination that does not match a registered user, the API SHALL return HTTP 401.

**Validates: Requirements 2.2**

---

### Property 3: Invalid or missing refresh tokens always return 401

*For any* string that is not a valid, non-expired refresh token stored in the system, a `POST /auth/refresh` request using that string SHALL return HTTP 401.

**Validates: Requirements 3.2**

---

### Property 4: All protected routes reject requests without a valid JWT

*For any* protected route and any request that lacks a valid, non-expired `Authorization: Bearer <token>` header, the JWT middleware SHALL return HTTP 401.

**Validates: Requirements 4.2, 5.1, 5.3, 5.4, 6.4**

---

### Property 5: Profile PATCH accepts any valid subset of updatable fields

*For any* non-empty subset of `{ fullName, phone, timezone, locale }` containing valid values, a `PATCH /me` request SHALL succeed with HTTP 200 and the response body SHALL reflect the updated values.

**Validates: Requirements 6.2**

---

### Property 6: Profile PATCH rejects invalid field values

*For any* `PATCH /me` request body containing a field value that violates its validation rule (e.g., `fullName` shorter than 2 characters), the API SHALL return HTTP 400.

**Validates: Requirements 6.3**

---

### Property 7: Device registration round-trip

*For any* set of N devices registered via `POST /me/devices`, a subsequent `GET /me/devices` SHALL return a list containing all N registered devices.

**Validates: Requirements 7.2**

---

### Property 8: Device input validation

*For any* `POST /me/devices` request body where `platform` or `pushToken` is missing or invalid, the API SHALL return HTTP 400.

**Validates: Requirements 7.5**

---

### Property 9: Dose event listing respects date range bounds

*For any* valid `from`/`to` date range, all DoseEvents returned by `GET /dose-events` SHALL have `scheduledAt` within the interval `[from, to]`.

**Validates: Requirements 8.1**

---

### Property 10: Dose event listing respects status and prescription filters

*For any* `status` filter value, all returned DoseEvents SHALL have that exact status. *For any* `prescription_id` filter value, all returned DoseEvents SHALL belong to that prescription.

**Validates: Requirements 8.2, 8.3**

---

### Property 11: Pagination metadata is mathematically consistent

*For any* paginated endpoint with N total items and a `per_page` value of P, the response SHALL satisfy: `total_pages = ceil(N / P)`, `has_next = page < total_pages`, `has_prev = page > 1`.

**Validates: Requirements 8.4, 14.3**

---

### Property 12: Snooze sets status to SNOOZED and computes snoozedTo correctly

*For any* DoseEvent in `PENDING` or `NOTIFIED` status and any `minutes` value in `[5, 120]`, a snooze request SHALL set `status = SNOOZED` and `snoozedTo ≈ now + minutes`.

**Validates: Requirements 10.1, 12.2**

---

### Property 13: Snooze rejects out-of-range minutes

*For any* `minutes` value less than 5 or greater than 120, a snooze request SHALL return HTTP 400.

**Validates: Requirements 10.2**

---

### Property 14: Snooze rejects terminal-status events

*For any* DoseEvent in `TAKEN`, `SKIPPED`, or `MISSED` status, a snooze request SHALL return HTTP 409.

**Validates: Requirements 10.3**

---

### Property 15: Batch actions return a result entry for every input event

*For any* batch request containing N event items (valid or invalid), the response SHALL contain exactly N result entries — successes for valid events and failure/conflict entries for invalid or terminal-status events — without aborting the entire batch.

**Validates: Requirements 11.1, 11.2, 11.3**

---

### Property 16: SNOOZED events accept taken/skipped transitions

*For any* DoseEvent in `SNOOZED` status, marking it as `TAKEN` or `SKIPPED` SHALL succeed and update the status accordingly.

**Validates: Requirements 12.4**

---

### Property 17: Adherence rate formula is always correct

*For any* set of dose events with counts `took`, `skipped`, and `missed`, the `adherenceRate` in the summary response SHALL equal `took / (took + skipped + missed)` rounded to 4 decimal places. When the denominator is zero, `adherenceRate` SHALL be `0`.

**Validates: Requirements 13.2**

---

### Property 18: Adherence summary and history respect prescription filter

*For any* `prescription_id` filter, all dose events counted in the summary and all entries returned in the history SHALL belong to that prescription.

**Validates: Requirements 13.3, 14.2**

---

### Property 19: Export CSV contains all required columns for every row

*For any* set of dose events in the requested period, the exported CSV SHALL contain a row for each event, and every row SHALL include at minimum: date, prescription name, scheduled time, status, and taken/skipped timestamp.

**Validates: Requirements 15.5**

---

### Property 20: Caregiver invite expiry is always 7 days from creation

*For any* created caregiver invite, `expiresAt` SHALL equal `createdAt + 7 days`.

**Validates: Requirements 17.3**

---

### Property 21: Caregiver list round-trip

*For any* set of N accepted caregiver invites for a user, `GET /caregivers` SHALL return exactly those N active caregiver links.

**Validates: Requirements 19.1**

---

### Property 22: Webhook rejects requests with invalid or missing HMAC signature

*For any* webhook request that does not carry a valid HMAC-SHA256 signature matching the shared secret, the API SHALL return HTTP 401 or HTTP 403.

**Validates: Requirements 20.3**

---

### Property 23: Webhook input validation

*For any* `POST /webhooks/notification/delivery` request body where `doseEventId` or `deliveryStatus` is missing or malformed, the API SHALL return HTTP 400.

**Validates: Requirements 20.2**

---

### Property 24: Caregiver invite input validation

*For any* `POST /caregivers/invite` request body where `fullName`, `email`, or `permission` is missing, the API SHALL return HTTP 400.

**Validates: Requirements 17.2**

---

## Error Handling

### Standard Error Response

All error responses follow the existing `AppError` pattern and return:

```json
{ "code": "ERROR_CODE", "message": "Human-readable description" }
```

The `AppError` class is extended with a `code` field to support machine-readable error codes:

```typescript
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}
```

### Error Catalogue

| Scenario | HTTP Status | Code |
|---|---|---|
| Missing/invalid request field | 400 | `VALIDATION_ERROR` |
| Email already registered | 409 | `EMAIL_CONFLICT` |
| Invalid credentials | 401 | `INVALID_CREDENTIALS` |
| Missing/invalid JWT | 401 | `UNAUTHORIZED` |
| Expired JWT | 401 | `TOKEN_EXPIRED` |
| Invalid/expired refresh token | 401 | `INVALID_REFRESH_TOKEN` |
| Resource not found or not owned by user | 404 | `NOT_FOUND` |
| Snooze on terminal-status event | 409 | `INVALID_STATUS_TRANSITION` |
| Batch item conflict | 409 (per-item) | `CONFLICT` |
| Invalid HMAC signature | 401 | `INVALID_SIGNATURE` |
| Dependency unhealthy | 503 | `SERVICE_UNAVAILABLE` |

### Validation

All route handlers use Zod schemas registered with `fastify-type-provider-zod`. Validation errors are caught by the existing Fastify error handler in `server.ts`, which returns HTTP 400 with the validation details.

### Domain Errors

Domain-level errors (e.g., invalid status transition, not found) are thrown as `AppError` instances from use cases and propagated to the Fastify error handler.

### Batch Partial Failures

The batch endpoint (`POST /dose-events/batch`) does not throw on per-item failures. Each item is processed independently; failures are collected and returned in the response body:

```typescript
interface BatchResultDTO {
  processed: number
  succeeded: number
  failed: number
  results: Array<{
    id: string
    status: 'success' | 'not_found' | 'conflict'
    error?: string
  }>
}
```

---

## Testing Strategy

### Dual Testing Approach

The project uses **Vitest** (already configured in `package.json`) for all tests.

- **Unit tests** cover specific examples, edge cases, and error conditions for use cases and domain entities.
- **Property-based tests** verify universal properties across many generated inputs using **fast-check** (a mature PBT library for TypeScript/JavaScript).

### Property-Based Testing Setup

Install fast-check:

```bash
pnpm add -D fast-check
```

Each property test runs a minimum of **100 iterations**. Tests are tagged with a comment referencing the design property:

```typescript
// Feature: api-missing-features, Property 17: Adherence rate formula is always correct
it.prop([fc.nat(), fc.nat(), fc.nat()])('adherence rate formula', (took, skipped, missed) => {
  const denominator = took + skipped + missed
  const expected = denominator === 0 ? 0 : Math.round((took / denominator) * 10000) / 10000
  const result = computeAdherenceRate(took, skipped, missed)
  expect(result).toBe(expected)
})
```

### Test File Structure

```
src/
  tests/
    unit/
      domain/
        DoseEvent.spec.ts          ← status transitions, snooze logic
        User.spec.ts               ← profile update, password hashing
        CaregiverInvite.spec.ts    ← expiry calculation
      usecases/
        RegisterUser.spec.ts
        LoginUser.spec.ts
        SnoozeDoseEvent.spec.ts
        BatchDoseActions.spec.ts
        GetAdherenceSummary.spec.ts
        ExportAdherenceReport.spec.ts
    property/
      auth.property.spec.ts        ← Properties 1, 2, 3, 4
      profile.property.spec.ts     ← Properties 5, 6
      devices.property.spec.ts     ← Properties 7, 8
      dose-events.property.spec.ts ← Properties 9, 10, 11, 12, 13, 14, 15, 16
      adherence.property.spec.ts   ← Properties 17, 18, 19
      caregivers.property.spec.ts  ← Properties 20, 21, 24
      webhooks.property.spec.ts    ← Properties 22, 23
    integration/
      health.integration.spec.ts   ← Requirements 16.1, 16.2
      auth-persistence.spec.ts     ← Requirement 2.4
```

### Unit Test Focus

Unit tests target use cases with mocked repositories. They cover:

- Happy path examples (registration, login, profile retrieval, device CRUD, etc.)
- Specific edge cases (duplicate email → 409, expired invite → 404, terminal status → 409)
- Domain entity state machine transitions

### Property Test Focus

Property tests target pure business logic functions (adherence rate calculation, pagination metadata, snooze timestamp computation, CSV column presence) and use fast-check generators to cover the full input space. Repository calls are mocked.

### Integration Test Focus

Integration tests (run against a test PostgreSQL + Redis instance via Docker Compose) cover:

- Health check endpoint with real DB/Redis connections
- Refresh token persistence after login
- Webhook HMAC signature validation end-to-end

### OpenTelemetry

All new use cases and repository methods follow the existing `withDbSpan` pattern for database tracing. New HTTP routes are automatically instrumented by `@opentelemetry/instrumentation-fastify`.

### Running Tests

```bash
# All tests (single run)
pnpm vitest --run

# Watch mode (development)
pnpm vitest

# Coverage
pnpm vitest --run --coverage
```
