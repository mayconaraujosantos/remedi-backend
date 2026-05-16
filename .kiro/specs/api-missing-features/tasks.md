# Implementation Plan: api-missing-features

## Overview

Implement the missing features identified in the gap analysis between the current `reminder-api` and the target OpenAPI spec. The work is organized into six areas: Authentication & Session, User Profile & Devices, Dose Events (extended), Adherence, Health Check, and Caregivers & Webhooks. All code follows the existing Clean Architecture layering (domain → application → infra → main) and uses TypeScript, Fastify, Drizzle ORM, tsyringe, and Zod.

## Tasks

- [-] 0. Refactor server into composition root + infrastructure modules
  - [x] 0.1 Create `src/infra/http/server/plugins/registerCors.ts` — extract `@fastify/cors` registration from `Server.ts`
  - [x] 0.2 Create `src/infra/http/server/plugins/registerSwagger.ts` — extract `@fastify/swagger` + `@fastify/swagger-ui` registration from `Server.ts`
  - [x] 0.3 Create `src/infra/http/server/plugins/registerZod.ts` — extract `setValidatorCompiler` / `setSerializerCompiler` calls from `Server.ts`
  - [x] 0.4 Create `src/infra/http/server/errors/setupErrorHandler.ts` — extract the `setErrorHandler` block from `Server.ts`; keep OTel span recording and `trackHttpServerError` calls intact
  - [x] 0.5 Create `src/infra/http/server/docs/exportSwaggerYaml.ts` — extract the `exportSwaggerConfig` method from `Server.ts`
  - [x] 0.6 Create `src/infra/http/server/lifecycle/setupGracefulShutdown.ts` — add `SIGTERM`/`SIGINT` handlers that call `app.close()` and `process.exit(0)`
  - [-] 0.7 Create `src/infra/http/server/routes/registerRoutes.ts` — export a single `registerRoutes(app)` function that registers all existing route modules (`reminderRoutes`, `medicationRoutes`, `categoryRoutes`, `doseRoutes`) and will be the single place to add new routes going forward
  - [-] 0.8 Create `src/infra/http/server/createServer.ts` — export `createServer(): FastifyInstance` that calls `registerZod`, `registerCors`, `registerSwagger`, `setupErrorHandler`, and `registerRoutes` in order; returns the configured app without starting it
  - [ ] 0.9 Rewrite `src/main/server/Server.ts` so it only: imports `createServer`, calls `app.listen(...)`, calls `exportSwaggerYaml`, and calls `setupGracefulShutdown` — no plugin or route logic remains in this file
  - Verify the server starts and all existing routes (`/reminders`, `/medications`, `/categories`, `/medications/doses`) still respond correctly after the refactor

- [ ] 1. Extend shared infrastructure and install new dependencies
  - Install `jsonwebtoken`, `@types/jsonwebtoken`, `bcrypt`, `@types/bcrypt`, `fast-check`, `csv-stringify`, and `pdfkit` via pnpm
  - Extend `AppError` in `src/shared/errors/AppError.ts` to include a `code` field and update the Fastify error handler in `server.ts` to serialize it
  - Add new domain error classes: `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError` in `src/domain/errors/`
  - _Requirements: 1.3, 2.2, 2.3, 4.2, 5.3_

- [ ] 2. Add new Drizzle schema tables and extend existing ones
  - [-] 2.1 Add `users`, `refresh_tokens`, `user_devices`, `prescriptions`, `caregiver_invites`, `caregiver_links`, and `notification_deliveries` tables to `src/infra/db/schema/schema.ts`
    - Follow the exact column definitions from the design document
    - _Requirements: 1.1, 2.4, 7.1, 17.1, 18.1, 20.1_
  - [-] 2.2 Extend the `dose_events` table in `src/infra/db/schema/schema.ts` with `userId`, `prescriptionId`, `notifiedAt`, `snoozedTo`, and `updatedAt` columns; extend the `status` enum to include `NOTIFIED` and `SNOOZED`
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 3. Implement User and Auth domain layer
  - [-] 3.1 Create `User` domain entity in `src/domain/entities/User.ts` with `updateProfile()` method
    - _Requirements: 1.1, 6.1, 6.2_
  - [-] 3.2 Create `UserRepository` interface in `src/domain/repositories/UserRepository.ts` with `create`, `findByEmail`, `findById`, `update` methods
    - _Requirements: 1.1, 2.1, 6.2_
  - [ ] 3.3 Create `RefreshTokenRepository` interface in `src/domain/repositories/RefreshTokenRepository.ts` with `create`, `findByToken`, `deleteByUserId` methods
    - _Requirements: 2.4, 3.1, 4.1_
  - [ ]* 3.4 Write unit tests for `User` entity
    - Test `updateProfile()` with valid and invalid inputs
    - Test entity construction and defaults
    - _Requirements: 6.2, 6.3_

- [ ] 4. Implement Auth use cases and service
  - [ ] 4.1 Create `RegisterUser` use case in `src/application/usecases/RegisterUser.ts`
    - Hash password with bcrypt (cost 12), create User, issue Access_Token + Refresh_Token
    - Throw `ConflictError` on duplicate email
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  - [ ] 4.2 Create `LoginUser` use case in `src/application/usecases/LoginUser.ts`
    - Verify bcrypt hash, issue tokens, persist Refresh_Token
    - Throw `UnauthorizedError` on invalid credentials
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ] 4.3 Create `RefreshToken` use case in `src/application/usecases/RefreshToken.ts`
    - Validate stored token, issue new Access_Token
    - Throw `UnauthorizedError` on invalid/expired token
    - _Requirements: 3.1, 3.2_
  - [ ] 4.4 Create `LogoutUser` use case in `src/application/usecases/LogoutUser.ts`
    - Delete Refresh_Token record for the authenticated user
    - _Requirements: 4.1_
  - [ ] 4.5 Create `AuthService` in `src/application/services/AuthService.ts` composing the four use cases
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  - [ ]* 4.6 Write unit tests for `RegisterUser` use case
    - Test happy path, duplicate email conflict, missing fields
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 4.7 Write unit tests for `LoginUser` use case
    - Test happy path, invalid credentials
    - _Requirements: 2.1, 2.2_
  - [ ]* 4.8 Write property test for input validation (Properties 1, 2, 3)
    - **Property 1: Input validation rejects any body with a missing required field**
    - **Property 2: Invalid credentials always return 401**
    - **Property 3: Invalid or missing refresh tokens always return 401**
    - **Validates: Requirements 1.3, 2.2, 2.3, 3.2**

- [ ] 5. Implement Auth infra layer
  - [ ] 5.1 Create `UserRepositoryDrizzle` in `src/infra/db/repositories/UserRepositoryDrizzle.ts`
    - Implement `create`, `findByEmail`, `findById`, `update` using Drizzle + `withDbSpan`
    - _Requirements: 1.1, 2.1, 6.2_
  - [ ] 5.2 Create `RefreshTokenRepositoryDrizzle` in `src/infra/db/repositories/RefreshTokenRepositoryDrizzle.ts`
    - Implement `create`, `findByToken`, `deleteByUserId`
    - _Requirements: 2.4, 3.1, 4.1_
  - [ ] 5.3 Create `JwtAuthMiddleware` in `src/infra/http/middleware/JwtAuthMiddleware.ts`
    - Verify `Authorization: Bearer <token>` header using `jsonwebtoken`
    - Attach decoded user identity to `request.user`
    - Return HTTP 401 for missing, malformed, or expired tokens
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 5.4 Create `AuthController` in `src/infra/http/controllers/AuthController.ts` with `register`, `login`, `refresh`, `logout` methods
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  - [ ] 5.5 Create `AuthRoutes` in `src/infra/http/routes/AuthRoutes.ts` with Zod validators for all four endpoints; register routes in `server.ts`
    - Public routes: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
    - Protected route: `POST /auth/logout`
    - _Requirements: 1.1, 1.3, 2.1, 2.3, 3.1, 3.3, 4.1, 4.2_
  - [ ]* 5.6 Write property test for JWT middleware (Property 4)
    - **Property 4: All protected routes reject requests without a valid JWT**
    - **Validates: Requirements 4.2, 5.1, 5.3, 5.4, 6.4**

- [ ] 6. Checkpoint — Auth layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement User Profile and Device domain & application layer
  - [ ] 7.1 Create `UserDevice` domain entity in `src/domain/entities/UserDevice.ts`
    - _Requirements: 7.1_
  - [ ] 7.2 Create `UserDeviceRepository` interface in `src/domain/repositories/UserDeviceRepository.ts` with `create`, `findByUserId`, `findByIdAndUserId`, `delete` methods
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 7.3 Create `GetUserProfile` and `UpdateUserProfile` use cases in `src/application/usecases/`
    - `UpdateUserProfile` validates field constraints (e.g., `fullName` min 2 chars) and throws `AppError` HTTP 400 on violation
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 7.4 Create `RegisterDevice`, `ListDevices`, `RemoveDevice` use cases in `src/application/usecases/`
    - `RemoveDevice` throws `NotFoundError` when device does not belong to user
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 7.5 Create `UserService` and `DeviceService` in `src/application/services/`
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3_
  - [ ]* 7.6 Write property tests for profile and device (Properties 5, 6, 7, 8)
    - **Property 5: Profile PATCH accepts any valid subset of updatable fields**
    - **Property 6: Profile PATCH rejects invalid field values**
    - **Property 7: Device registration round-trip**
    - **Property 8: Device input validation**
    - **Validates: Requirements 6.2, 6.3, 7.2, 7.5**

- [ ] 8. Implement User Profile and Device infra layer
  - [ ] 8.1 Create `UserDeviceRepositoryDrizzle` in `src/infra/db/repositories/UserDeviceRepositoryDrizzle.ts`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 8.2 Create `UserController` in `src/infra/http/controllers/UserController.ts` with `getProfile` and `updateProfile` methods
    - _Requirements: 6.1, 6.2_
  - [ ] 8.3 Create `DeviceController` in `src/infra/http/controllers/DeviceController.ts` with `register`, `list`, `remove` methods
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 8.4 Create `UserRoutes` in `src/infra/http/routes/UserRoutes.ts` for `GET /me` and `PATCH /me`; create `DeviceRoutes` for `POST /me/devices`, `GET /me/devices`, `DELETE /me/devices/:deviceId`; register both in `server.ts` with JWT middleware
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Extend DoseEvent domain entity and repository
  - [ ] 9.1 Extend `DoseEvent` entity in `src/domain/entities/DoseEvent.ts` with `userId`, `prescriptionId`, `notifiedAt`, `snoozedTo` fields; add `markAsNotified()` and `snooze(minutes)` methods; enforce valid status transitions
    - `snooze()` throws `AppError` HTTP 409 for terminal statuses; throws `AppError` HTTP 400 for minutes outside [5, 120]
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 10.1, 10.2, 10.3_
  - [ ] 9.2 Extend `DoseEventRepository` interface in `src/domain/repositories/DoseEventRepository.ts` with `findByUserId`, `findByUserIdAndId`, `countByUserId` methods
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1_
  - [ ]* 9.3 Write unit tests for extended `DoseEvent` entity
    - Test all status transitions (valid and invalid)
    - Test `snooze()` with boundary minutes values (4, 5, 120, 121)
    - Test `markAsNotified()` and `markAsTaken()` from `SNOOZED`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 10.1, 10.2, 10.3_

- [ ] 10. Implement extended Dose Event use cases and service
  - [ ] 10.1 Create `ListDoseEvents` use case in `src/application/usecases/ListDoseEvents.ts`
    - Apply `from`/`to`, `status`, `prescriptionId` filters; return `PaginatedResult<DoseEventDTO>`
    - Throw `AppError` HTTP 400 when `from` or `to` is missing
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [ ] 10.2 Create `GetDoseEvent` use case in `src/application/usecases/GetDoseEvent.ts`
    - Throw `NotFoundError` when event not found or not owned by user
    - _Requirements: 9.1, 9.2_
  - [ ] 10.3 Create `SnoozeDoseEvent` use case in `src/application/usecases/SnoozeDoseEvent.ts`
    - Delegate snooze logic to `DoseEvent.snooze()`; persist via repository
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [ ] 10.4 Create `BatchDoseActions` use case in `src/application/usecases/BatchDoseActions.ts`
    - Process each item independently; collect per-item success/failure/conflict results
    - Return `BatchResultDTO` without aborting on per-item errors
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [ ] 10.5 Extend `DoseEventService` in `src/application/services/DoseService.ts` with `list`, `getById`, `snooze`, `batchAction` methods
    - _Requirements: 8.1, 9.1, 10.1, 11.1_
  - [ ]* 10.6 Write property tests for dose events (Properties 9, 10, 11, 12, 13, 14, 15, 16)
    - **Property 9: Dose event listing respects date range bounds**
    - **Property 10: Dose event listing respects status and prescription filters**
    - **Property 11: Pagination metadata is mathematically consistent**
    - **Property 12: Snooze sets status to SNOOZED and computes snoozedTo correctly**
    - **Property 13: Snooze rejects out-of-range minutes**
    - **Property 14: Snooze rejects terminal-status events**
    - **Property 15: Batch actions return a result entry for every input event**
    - **Property 16: SNOOZED events accept taken/skipped transitions**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 12.4**
  - [ ]* 10.7 Write unit tests for `BatchDoseActions` use case
    - Test partial failure scenarios (mix of valid, not-found, and terminal-status events)
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 11. Implement extended Dose Event infra layer
  - [ ] 11.1 Extend `DoseEventRepositoryDrizzle` in `src/infra/db/repositories/DoseEventRepositoryDrizzle.ts` with `findByUserId`, `findByUserIdAndId`, `countByUserId` implementations using Drizzle filters and `withDbSpan`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1_
  - [ ] 11.2 Create `DoseEventController` (extended) in `src/infra/http/controllers/DoseEventController.ts` with `list`, `getById`, `snooze`, `batchAction` methods
    - _Requirements: 8.1, 9.1, 10.1, 11.1_
  - [ ] 11.3 Create `DoseEventRoutes` (extended) in `src/infra/http/routes/DoseEventRoutes.ts` for `GET /dose-events`, `GET /dose-events/:id`, `POST /dose-events/:id/snooze`, `POST /dose-events/batch`; register in `server.ts` with JWT middleware
    - _Requirements: 8.1, 8.5, 9.1, 10.1, 10.2, 11.1, 11.4_

- [ ] 12. Checkpoint — Dose Events layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement Adherence domain and application layer
  - [ ] 13.1 Create `computeAdherenceRate(took, skipped, missed)` pure function in `src/domain/utils/adherence.ts`
    - Returns `took / (took + skipped + missed)` rounded to 4 decimal places; returns `0` when denominator is zero
    - _Requirements: 13.2_
  - [ ] 13.2 Create `GetAdherenceSummary` use case in `src/application/usecases/GetAdherenceSummary.ts`
    - Query dose events for user/period/prescription; compute summary fields using `computeAdherenceRate`
    - Throw `AppError` HTTP 400 when `from > to` or required params missing
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  - [ ] 13.3 Create `GetAdherenceHistory` use case in `src/application/usecases/GetAdherenceHistory.ts`
    - Return paginated adherence log entries; enforce max `per_page` of 100
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  - [ ] 13.4 Create `ExportAdherenceReport` use case in `src/application/usecases/ExportAdherenceReport.ts`
    - Generate CSV using `csv-stringify` or PDF using `pdfkit`; include required columns per design
    - Throw `AppError` HTTP 400 for unsupported format or missing params
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  - [ ] 13.5 Create `AdherenceService` in `src/application/services/AdherenceService.ts` composing the three use cases
    - _Requirements: 13.1, 14.1, 15.1_
  - [ ]* 13.6 Write property tests for adherence (Properties 17, 18, 19)
    - **Property 17: Adherence rate formula is always correct**
    - **Property 18: Adherence summary and history respect prescription filter**
    - **Property 19: Export CSV contains all required columns for every row**
    - **Validates: Requirements 13.2, 13.3, 14.2, 15.5**
  - [ ]* 13.7 Write unit tests for `GetAdherenceSummary` and `ExportAdherenceReport`
    - Test zero-denominator edge case for adherence rate
    - Test CSV column presence and PDF content type
    - _Requirements: 13.2, 15.1, 15.2, 15.5_

- [ ] 14. Implement Adherence infra layer
  - [ ] 14.1 Create `AdherenceController` in `src/infra/http/controllers/AdherenceController.ts` with `getSummary`, `getHistory`, `exportReport` methods
    - Set `Content-Type: text/csv` or `application/pdf` for export responses
    - _Requirements: 15.1, 15.2_
  - [ ] 14.2 Create `AdherenceRoutes` in `src/infra/http/routes/AdherenceRoutes.ts` for `GET /adherence/summary`, `GET /adherence/history`, `GET /adherence/export`; register in `server.ts` with JWT middleware
    - _Requirements: 13.1, 13.4, 13.5, 14.1, 14.5, 15.1, 15.3, 15.4_

- [ ] 15. Implement Health Check
  - [~] 15.1 Create `HealthController` in `src/infra/http/controllers/HealthController.ts`
    - Probe PostgreSQL with `SELECT 1` and Redis with `PING`; return `{ status, checks }` with HTTP 200 or 503
    - _Requirements: 16.1, 16.2_
  - [~] 15.2 Create `HealthRoutes` in `src/infra/http/routes/HealthRoutes.ts` for `GET /health` (no JWT middleware); register in `server.ts`
    - _Requirements: 16.1, 16.2, 16.3_

- [ ] 16. Implement Caregivers domain and application layer
  - [~] 16.1 Create `CaregiverInvite` and `CaregiverLink` domain entities in `src/domain/entities/`
    - `CaregiverInvite` sets `expiresAt = createdAt + 7 days` at construction
    - _Requirements: 17.1, 17.3, 18.1_
  - [~] 16.2 Create `CaregiverRepository` and `InviteRepository` interfaces in `src/domain/repositories/`
    - _Requirements: 17.1, 18.1, 19.1, 19.2_
  - [~] 16.3 Create `InviteCaregiver`, `AcceptCaregiverInvite`, `ListCaregivers`, `RemoveCaregiver` use cases in `src/application/usecases/`
    - `AcceptCaregiverInvite` throws `NotFoundError` for expired or non-existent invites
    - `RemoveCaregiver` throws `NotFoundError` when link not owned by user
    - _Requirements: 17.1, 17.2, 18.1, 18.2, 19.1, 19.2, 19.3_
  - [~] 16.4 Create `CaregiverService` in `src/application/services/CaregiverService.ts`
    - _Requirements: 17.1, 18.1, 19.1_
  - [ ]* 16.5 Write property tests for caregivers (Properties 20, 21, 24)
    - **Property 20: Caregiver invite expiry is always 7 days from creation**
    - **Property 21: Caregiver list round-trip**
    - **Property 24: Caregiver invite input validation**
    - **Validates: Requirements 17.2, 17.3, 19.1**
  - [ ]* 16.6 Write unit tests for `CaregiverInvite` entity and `AcceptCaregiverInvite` use case
    - Test expiry calculation, expired invite rejection
    - _Requirements: 17.3, 18.2_

- [ ] 17. Implement Caregivers infra layer
  - [~] 17.1 Create `CaregiverRepositoryDrizzle` and `InviteRepositoryDrizzle` in `src/infra/db/repositories/`
    - _Requirements: 17.1, 18.1, 19.1, 19.2_
  - [~] 17.2 Create `CaregiverController` in `src/infra/http/controllers/CaregiverController.ts` with `invite`, `acceptInvite`, `list`, `remove` methods
    - _Requirements: 17.1, 18.1, 19.1, 19.2_
  - [~] 17.3 Create `CaregiverRoutes` in `src/infra/http/routes/CaregiverRoutes.ts` for `POST /caregivers/invite`, `POST /caregivers/invite/:inviteId/accept` (public), `GET /caregivers`, `DELETE /caregivers/:caregiverId`; register in `server.ts`
    - _Requirements: 17.1, 17.2, 18.1, 18.3, 19.1, 19.2, 19.3_

- [ ] 18. Implement Notification Delivery Webhook
  - [~] 18.1 Create `ProcessNotificationWebhook` use case in `src/application/usecases/ProcessNotificationWebhook.ts`
    - Validate HMAC-SHA256 signature from `X-Webhook-Signature` header against `WEBHOOK_SECRET` env var
    - Update `notification_deliveries` record; throw `AppError` HTTP 401 on invalid signature
    - _Requirements: 20.1, 20.3_
  - [~] 18.2 Create `WebhookService` in `src/application/services/WebhookService.ts`
    - _Requirements: 20.1, 20.3_
  - [~] 18.3 Create `WebhookController` in `src/infra/http/controllers/WebhookController.ts` and `WebhookRoutes` in `src/infra/http/routes/WebhookRoutes.ts` for `POST /webhooks/notification/delivery`; register in `server.ts` (no JWT middleware)
    - _Requirements: 20.1, 20.2, 20.3_
  - [ ]* 18.4 Write property tests for webhooks (Properties 22, 23)
    - **Property 22: Webhook rejects requests with invalid or missing HMAC signature**
    - **Property 23: Webhook input validation**
    - **Validates: Requirements 20.2, 20.3**

- [ ] 19. Wire DI container and register all new bindings
  - [~] 19.1 Register all new repositories, services, use cases, and controllers in `src/main/container/container.ts`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 13.1, 14.1, 15.1, 16.1, 17.1, 18.1, 19.1, 20.1_
  - [~] 19.2 Register all new route modules in `src/main/server/server.ts`
    - Apply `JwtAuthMiddleware` as a `preHandler` on all protected route groups
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [~] 20. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use `fast-check` and validate universal correctness properties (install with `pnpm add -D fast-check`)
- Unit tests validate specific examples and edge cases
- Run tests with `pnpm vitest --run`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6"] },
    { "id": 1, "tasks": ["0.7", "0.8", "2.1", "2.2", "3.1", "3.2", "3.3"] },
    { "id": 2, "tasks": ["0.9", "4.1", "4.2", "4.3", "4.4", "7.1", "7.2", "9.1", "9.2", "16.1", "16.2"] },
    { "id": 3, "tasks": ["3.4", "4.5", "7.3", "7.4", "9.3", "10.1", "10.2", "10.3", "10.4", "13.1", "16.3"] },
    { "id": 4, "tasks": ["4.6", "4.7", "4.8", "5.1", "5.2", "7.5", "10.5", "13.2", "13.3", "13.4", "16.4", "18.1", "18.2"] },
    { "id": 5, "tasks": ["5.3", "5.4", "7.6", "8.1", "10.6", "10.7", "11.1", "13.5", "13.6", "13.7", "16.5", "16.6", "18.3"] },
    { "id": 6, "tasks": ["5.5", "5.6", "8.2", "8.3", "11.2", "14.1", "15.1", "17.1", "18.4"] },
    { "id": 7, "tasks": ["8.4", "11.3", "14.2", "15.2", "17.2"] },
    { "id": 8, "tasks": ["17.3", "19.1"] },
    { "id": 9, "tasks": ["19.2"] }
  ]
}
```
