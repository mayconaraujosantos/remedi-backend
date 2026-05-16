# Requirements Document

## Introduction

This document covers the missing features identified in the gap analysis between the current `reminder-api` implementation and the target OpenAPI specification (`reminder-api.yml`). The API is a Node.js/TypeScript REST service built with Fastify, Drizzle ORM, tsyringe, and Zod. It follows Clean Architecture (domain → application → infra layers).

The features are grouped by priority: Authentication & User Management (high), Dose Events enhancements (medium), Adherence Reports (medium), Health Check (low), Caregivers (low/future), and Webhooks (low/future).

---

## Glossary

- **API**: The `reminder-api` Fastify HTTP server.
- **User**: A registered account identified by a UUID, with email, hashed password, full name, phone, timezone, and locale.
- **Access_Token**: A short-lived JWT (JSON Web Token) used to authenticate requests via the `Authorization: Bearer` header.
- **Refresh_Token**: A long-lived opaque token stored in the database or Redis, used to obtain a new Access_Token.
- **Auth_Service**: The application service responsible for registration, login, token refresh, and logout.
- **JWT_Middleware**: The Fastify middleware that validates the `Authorization: Bearer <token>` header on protected routes.
- **Device**: A push-notification device registered by a User, identified by platform and push token.
- **DoseEvent**: A scheduled or ad-hoc medication dose occurrence with a status lifecycle.
- **DoseStatus**: The lifecycle state of a DoseEvent — one of `PENDING`, `NOTIFIED`, `TAKEN`, `SKIPPED`, `MISSED`, `SNOOZED`.
- **Adherence_Service**: The application service that computes and exports adherence metrics.
- **AdherenceRate**: The ratio of `TAKEN` dose events to total non-`PENDING` dose events in a given period, expressed as a decimal between 0 and 1.
- **Pagination**: A standard envelope `{ items, pagination }` where `pagination` contains `page`, `per_page`, `total`, `total_pages`, `has_next`, `has_prev`.
- **Error_Response**: A standard error body `{ code: string, message: string }`.
- **Health_Check**: A system endpoint that reports the liveness of the API and its dependencies.
- **Caregiver**: A secondary User who has been granted permission to view or manage another User's medication data.
- **Invite**: A pending caregiver invitation identified by a UUID, with an expiry time.
- **Webhook**: An inbound HTTP callback from an external notification provider reporting delivery status.

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to create an account with my personal details, so that I can access the medication reminder service.

#### Acceptance Criteria

1. WHEN a `POST /auth/register` request is received with a valid body containing `fullName`, `email`, `password`, `phone`, `timezone`, and `locale`, THE Auth_Service SHALL create a new User record and return an `AuthTokensResponse` with HTTP 201.
2. WHEN a `POST /auth/register` request is received with an `email` that already exists in the database, THE Auth_Service SHALL return an Error_Response with HTTP 409.
3. WHEN a `POST /auth/register` request is received with a missing or malformed required field, THE API SHALL return an Error_Response with HTTP 400.
4. THE Auth_Service SHALL store the User's password as a bcrypt hash and SHALL NOT store the plaintext password.
5. WHEN a User is successfully registered, THE Auth_Service SHALL issue an Access_Token and a Refresh_Token and return both in the response body along with `expiresIn` in seconds.

---

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can obtain tokens to access protected endpoints.

#### Acceptance Criteria

1. WHEN a `POST /auth/login` request is received with a valid `email` and `password`, THE Auth_Service SHALL verify the password against the stored bcrypt hash and return an `AuthTokensResponse` with HTTP 200.
2. WHEN a `POST /auth/login` request is received with an unrecognised `email` or an incorrect `password`, THE Auth_Service SHALL return an Error_Response with HTTP 401.
3. WHEN a `POST /auth/login` request is received with a missing or malformed field, THE API SHALL return an Error_Response with HTTP 400.
4. WHEN a login succeeds, THE Auth_Service SHALL persist the Refresh_Token in the database or Redis with an associated expiry timestamp.

---

### Requirement 3: Token Refresh

**User Story:** As an authenticated user, I want to exchange a valid refresh token for a new access token, so that I can maintain my session without re-entering my credentials.

#### Acceptance Criteria

1. WHEN a `POST /auth/refresh` request is received with a valid, non-expired `refreshToken`, THE Auth_Service SHALL issue a new Access_Token and return an `AuthTokensResponse` with HTTP 200.
2. WHEN a `POST /auth/refresh` request is received with an expired or unrecognised `refreshToken`, THE Auth_Service SHALL return an Error_Response with HTTP 401.
3. WHEN a `POST /auth/refresh` request is received with a missing `refreshToken` field, THE API SHALL return an Error_Response with HTTP 400.

---

### Requirement 4: Logout

**User Story:** As an authenticated user, I want to log out, so that my refresh token is invalidated and cannot be reused.

#### Acceptance Criteria

1. WHEN a `POST /auth/logout` request is received with a valid Access_Token in the `Authorization` header, THE Auth_Service SHALL invalidate the associated Refresh_Token in the database or Redis and return HTTP 204.
2. WHEN a `POST /auth/logout` request is received without a valid Access_Token, THE JWT_Middleware SHALL return an Error_Response with HTTP 401.

---

### Requirement 5: JWT Authentication Middleware

**User Story:** As a system operator, I want all non-public endpoints to require a valid JWT, so that only authenticated users can access protected resources.

#### Acceptance Criteria

1. THE JWT_Middleware SHALL be applied to all routes except `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /health`, and `POST /caregivers/invite/:inviteId/accept`.
2. WHEN a protected request is received with a valid, non-expired Access_Token in the `Authorization: Bearer <token>` header, THE JWT_Middleware SHALL extract the User identity and make it available to the route handler.
3. WHEN a protected request is received without an `Authorization` header or with a malformed token, THE JWT_Middleware SHALL return an Error_Response with HTTP 401.
4. WHEN a protected request is received with an expired Access_Token, THE JWT_Middleware SHALL return an Error_Response with HTTP 401.

---

### Requirement 6: User Profile

**User Story:** As an authenticated user, I want to view and update my profile, so that I can keep my personal information current.

#### Acceptance Criteria

1. WHEN a `GET /me` request is received with a valid Access_Token, THE API SHALL return the authenticated User's profile with HTTP 200.
2. WHEN a `PATCH /me` request is received with a valid Access_Token and a body containing one or more of `fullName`, `phone`, `timezone`, or `locale`, THE API SHALL update the User record and return the updated profile with HTTP 200.
3. WHEN a `PATCH /me` request is received with an invalid field value (e.g., `fullName` shorter than 2 characters), THE API SHALL return an Error_Response with HTTP 400.
4. WHEN a `GET /me` or `PATCH /me` request is received without a valid Access_Token, THE JWT_Middleware SHALL return an Error_Response with HTTP 401.

---

### Requirement 7: Push Notification Device Management

**User Story:** As an authenticated user, I want to register and manage my push notification devices, so that I can receive dose reminders on my mobile devices.

#### Acceptance Criteria

1. WHEN a `POST /me/devices` request is received with a valid Access_Token and a body containing `platform` and `pushToken`, THE API SHALL create a Device record linked to the authenticated User and return the Device with HTTP 201.
2. WHEN a `GET /me/devices` request is received with a valid Access_Token, THE API SHALL return a list of all active Devices belonging to the authenticated User with HTTP 200.
3. WHEN a `DELETE /me/devices/:deviceId` request is received with a valid Access_Token and a `deviceId` that belongs to the authenticated User, THE API SHALL remove the Device and return HTTP 204.
4. WHEN a `DELETE /me/devices/:deviceId` request is received with a `deviceId` that does not belong to the authenticated User or does not exist, THE API SHALL return an Error_Response with HTTP 404.
5. WHEN a `POST /me/devices` request is received with a missing or invalid `platform` or `pushToken`, THE API SHALL return an Error_Response with HTTP 400.

---

### Requirement 8: Dose Event Listing with Filters and Pagination

**User Story:** As an authenticated user, I want to list my dose events filtered by date range, status, and prescription, so that I can review my medication schedule for any period.

#### Acceptance Criteria

1. WHEN a `GET /dose-events` request is received with valid `from` and `to` ISO 8601 datetime query parameters, THE API SHALL return a paginated list of DoseEvents belonging to the authenticated User that fall within the specified range, with HTTP 200.
2. WHEN a `GET /dose-events` request includes an optional `status` query parameter, THE API SHALL return only DoseEvents whose status matches the provided value.
3. WHEN a `GET /dose-events` request includes an optional `prescription_id` query parameter, THE API SHALL return only DoseEvents associated with the specified prescription.
4. WHEN a `GET /dose-events` request includes `page` and `per_page` query parameters, THE API SHALL return results using the Pagination envelope with correct `total`, `total_pages`, `has_next`, and `has_prev` values.
5. WHEN a `GET /dose-events` request is received without the required `from` or `to` parameters, THE API SHALL return an Error_Response with HTTP 400.
6. THE API SHALL support a maximum `per_page` value of 200 for dose event listing.

---

### Requirement 9: Single Dose Event Retrieval

**User Story:** As an authenticated user, I want to retrieve a single dose event by its ID, so that I can inspect its full details.

#### Acceptance Criteria

1. WHEN a `GET /dose-events/:id` request is received with a valid Access_Token and an `id` that belongs to the authenticated User, THE API SHALL return the DoseEvent with HTTP 200.
2. WHEN a `GET /dose-events/:id` request is received with an `id` that does not exist or does not belong to the authenticated User, THE API SHALL return an Error_Response with HTTP 404.

---

### Requirement 10: Dose Event Snooze

**User Story:** As an authenticated user, I want to snooze a pending dose event, so that I am reminded again after a short delay.

#### Acceptance Criteria

1. WHEN a `POST /dose-events/:id/snooze` request is received with a valid Access_Token, a DoseEvent `id` in `PENDING` or `NOTIFIED` status, and a `minutes` value between 5 and 120 inclusive, THE API SHALL update the DoseEvent status to `SNOOZED`, set `snoozedTo` to the current time plus the specified minutes, and return the updated DoseEvent with HTTP 200.
2. WHEN a `POST /dose-events/:id/snooze` request is received with a `minutes` value outside the range 5–120, THE API SHALL return an Error_Response with HTTP 400.
3. WHEN a `POST /dose-events/:id/snooze` request is received for a DoseEvent whose status is `TAKEN`, `SKIPPED`, or `MISSED`, THE API SHALL return an Error_Response with HTTP 409.
4. WHEN a `POST /dose-events/:id/snooze` request is received with an `id` that does not exist or does not belong to the authenticated User, THE API SHALL return an Error_Response with HTTP 404.

---

### Requirement 11: Batch Dose Event Actions

**User Story:** As an authenticated user, I want to mark multiple dose events as taken or skipped in a single request, so that I can efficiently update several doses at once.

#### Acceptance Criteria

1. WHEN a `POST /dose-events/batch` request is received with a valid Access_Token and a body containing an `events` array where each item has an `id` and an `action` of `took` or `skipped`, THE API SHALL process each event and return a batch result with HTTP 200.
2. WHEN a batch request contains an event `id` that does not exist or does not belong to the authenticated User, THE API SHALL include a failure entry for that item in the response without aborting the entire batch.
3. WHEN a batch request contains an event that is already in a terminal status (`TAKEN`, `SKIPPED`, `MISSED`), THE API SHALL include a conflict entry for that item in the response without aborting the entire batch.
4. WHEN a batch request body is missing the `events` array or the array is empty, THE API SHALL return an Error_Response with HTTP 400.

---

### Requirement 12: Extended DoseStatus Values

**User Story:** As a system operator, I want the DoseEvent status to include `NOTIFIED` and `SNOOZED` states, so that the notification lifecycle is fully represented in the domain.

#### Acceptance Criteria

1. THE DoseEvent entity SHALL support the status values `PENDING`, `NOTIFIED`, `TAKEN`, `SKIPPED`, `MISSED`, and `SNOOZED`.
2. WHEN a DoseEvent transitions to `SNOOZED`, THE DoseEvent SHALL record a `snoozedTo` timestamp.
3. WHEN a DoseEvent transitions to `NOTIFIED`, THE DoseEvent SHALL record a `notifiedAt` timestamp.
4. IF a DoseEvent in `SNOOZED` status is marked as taken or skipped, THEN THE API SHALL accept the transition and update the status accordingly.

---

### Requirement 13: Adherence Summary

**User Story:** As an authenticated user, I want to see a summary of my medication adherence for a given period, so that I can understand how consistently I am taking my medications.

#### Acceptance Criteria

1. WHEN a `GET /adherence/summary` request is received with valid `from` and `to` date query parameters, THE Adherence_Service SHALL compute and return an adherence summary for the authenticated User covering that period, with HTTP 200.
2. THE adherence summary SHALL include `total`, `took`, `skipped`, `missed`, and `adherenceRate` fields, where `adherenceRate` is calculated as `took / (took + skipped + missed)` and is expressed as a decimal rounded to 4 decimal places.
3. WHEN a `GET /adherence/summary` request includes an optional `prescription_id` query parameter, THE Adherence_Service SHALL restrict the calculation to DoseEvents associated with that prescription.
4. WHEN a `GET /adherence/summary` request is received with a `from` date that is after the `to` date, THE API SHALL return an Error_Response with HTTP 400.
5. WHEN a `GET /adherence/summary` request is received without the required `from` or `to` parameters, THE API SHALL return an Error_Response with HTTP 400.

---

### Requirement 14: Adherence History

**User Story:** As an authenticated user, I want to browse a paginated log of my dose events, so that I can review my adherence history in detail.

#### Acceptance Criteria

1. WHEN a `GET /adherence/history` request is received with valid `from` and `to` date query parameters, THE Adherence_Service SHALL return a paginated list of adherence log entries for the authenticated User, with HTTP 200.
2. WHEN a `GET /adherence/history` request includes an optional `prescription_id` query parameter, THE Adherence_Service SHALL filter the log to entries associated with that prescription.
3. WHEN a `GET /adherence/history` request includes `page` and `per_page` query parameters, THE API SHALL return results using the Pagination envelope with correct metadata.
4. THE API SHALL support a maximum `per_page` value of 100 for adherence history.
5. WHEN a `GET /adherence/history` request is received without the required `from` or `to` parameters, THE API SHALL return an Error_Response with HTTP 400.

---

### Requirement 15: Adherence Report Export

**User Story:** As an authenticated user, I want to export my adherence data as a CSV or PDF file, so that I can share it with my healthcare provider.

#### Acceptance Criteria

1. WHEN a `GET /adherence/export` request is received with valid `from` and `to` date query parameters and `format=csv`, THE Adherence_Service SHALL return a CSV file containing the adherence data for the authenticated User with HTTP 200 and `Content-Type: text/csv`.
2. WHEN a `GET /adherence/export` request is received with `format=pdf`, THE Adherence_Service SHALL return a PDF binary with HTTP 200 and `Content-Type: application/pdf`.
3. WHEN a `GET /adherence/export` request is received with an unsupported `format` value, THE API SHALL return an Error_Response with HTTP 400.
4. WHEN a `GET /adherence/export` request is received without the required `from` or `to` parameters, THE API SHALL return an Error_Response with HTTP 400.
5. THE exported file SHALL include at minimum: date, prescription name, scheduled time, status, and taken/skipped timestamp for each dose event in the period.

---

### Requirement 16: Health Check Endpoint

**User Story:** As a system operator, I want a health check endpoint, so that load balancers and monitoring tools can verify the API is operational.

#### Acceptance Criteria

1. WHEN a `GET /health` request is received, THE API SHALL return a response with HTTP 200 containing the status of the database connection and any configured Redis or message broker connections.
2. IF the database connection is unavailable, THEN THE API SHALL return a response with HTTP 503 indicating which dependency is unhealthy.
3. THE `GET /health` endpoint SHALL NOT require authentication.

---

### Requirement 17: Caregiver Invitation

**User Story:** As an authenticated user, I want to invite another person to be my caregiver, so that they can help monitor my medication adherence.

#### Acceptance Criteria

1. WHEN a `POST /caregivers/invite` request is received with a valid Access_Token and a body containing `fullName`, `email`, and `permission`, THE API SHALL create a pending Invite record and return the Invite with HTTP 201.
2. WHEN a `POST /caregivers/invite` request is received with a missing required field, THE API SHALL return an Error_Response with HTTP 400.
3. THE Invite SHALL have an expiry period of 7 days from creation, after which it SHALL be considered invalid.

---

### Requirement 18: Caregiver Invite Acceptance

**User Story:** As an invited caregiver, I want to accept a caregiver invitation, so that I can access the patient's medication data.

#### Acceptance Criteria

1. WHEN a `POST /caregivers/invite/:inviteId/accept` request is received with a valid, non-expired `inviteId`, THE API SHALL create a Caregiver link between the inviting User and the accepting User and return HTTP 200.
2. WHEN a `POST /caregivers/invite/:inviteId/accept` request is received with an expired or non-existent `inviteId`, THE API SHALL return an Error_Response with HTTP 404.
3. THE `POST /caregivers/invite/:inviteId/accept` endpoint SHALL NOT require authentication.

---

### Requirement 19: Caregiver Management

**User Story:** As an authenticated user, I want to list and remove my caregivers, so that I can control who has access to my medication data.

#### Acceptance Criteria

1. WHEN a `GET /caregivers` request is received with a valid Access_Token, THE API SHALL return a list of active Caregiver links for the authenticated User with HTTP 200.
2. WHEN a `DELETE /caregivers/:caregiverId` request is received with a valid Access_Token and a `caregiverId` that belongs to the authenticated User's caregiver list, THE API SHALL remove the Caregiver link and return HTTP 204.
3. WHEN a `DELETE /caregivers/:caregiverId` request is received with a `caregiverId` that does not exist or does not belong to the authenticated User, THE API SHALL return an Error_Response with HTTP 404.

---

### Requirement 20: Notification Delivery Webhook

**User Story:** As a system operator, I want to receive delivery status callbacks from the push notification provider, so that the system can track whether notifications were successfully delivered.

#### Acceptance Criteria

1. WHEN a `POST /webhooks/notification/delivery` request is received with a valid payload containing a `doseEventId` and a `deliveryStatus`, THE API SHALL update the corresponding DoseEvent's notification delivery record and return HTTP 200.
2. WHEN a `POST /webhooks/notification/delivery` request is received with a missing or malformed payload, THE API SHALL return an Error_Response with HTTP 400.
3. THE `POST /webhooks/notification/delivery` endpoint SHALL validate the request using a shared secret or HMAC signature to prevent unauthorised calls.
