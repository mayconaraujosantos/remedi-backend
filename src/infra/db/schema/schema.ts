import {
  pgTable,
  text,
  integer,
  timestamp,
  varchar,
  boolean,
  uuid,
  numeric,
  date,
} from 'drizzle-orm/pg-core'

export const medications = pgTable('medication', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(), // 'once', 'daily', etc
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  nextDoseAt: timestamp('next_dose_at').notNull(),
  categoryId: varchar('category_id', { length: 255 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const categories = pgTable('category', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reminders = pgTable('reminder', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completed: boolean('completed').notNull().default(false),
})

export const medicationSchedules = pgTable('medicationschedule', {
  id: varchar('id', { length: 255 }).primaryKey(),
  medicationId: varchar('medication_id', { length: 255 }).notNull(),
  type: text('type').notNull(), // 'ONCE', 'DAILY', 'WEEKLY', 'INTERVAL'
  intervalHours: integer('interval_hours'),
  daysOfWeek: integer('days_of_week').array(),
  times: text('times').array().notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
})

export const doseEvents = pgTable('doseevent', {
  id: varchar('id', { length: 255 }).primaryKey(),
  medicationId: varchar('medication_id', { length: 255 }).notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  takenAt: timestamp('taken_at'),
  skippedAt: timestamp('skipped_at'),
  // status: 'PENDING' | 'NOTIFIED' | 'TAKEN' | 'SKIPPED' | 'MISSED' | 'SNOOZED'
  status: text('status').notNull().default('PENDING'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  prescriptionId: uuid('prescription_id').references(() => prescriptions.id),
  notifiedAt: timestamp('notified_at'),
  snoozedTo: timestamp('snoozed_to'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── New tables ──────────────────────────────────────────────────────────────

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

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userDevices = pgTable('user_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(), // 'ios' | 'android'
  pushToken: text('push_token').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
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

export const caregiverInvites = pgTable('caregiver_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => users.id),
  inviteeEmail: text('invitee_email').notNull(),
  inviteeFullName: text('invitee_full_name').notNull(),
  permission: text('permission').notNull().default('view'), // 'view' | 'manage'
  status: text('status').notNull().default('pending'), // 'pending' | 'accepted' | 'expired'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const caregiverLinks = pgTable('caregiver_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => users.id),
  caregiverId: uuid('caregiver_id')
    .notNull()
    .references(() => users.id),
  permission: text('permission').notNull().default('view'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Note: notification_deliveries references doseEventsV2 which is defined in task 2.2.
// The table is declared here; the foreign key will reference the extended dose_events table.
export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  doseEventId: uuid('dose_event_id').notNull(),
  deliveryStatus: text('delivery_status').notNull(),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Export types ─────────────────────────────────────────────────────────────

export type Medication = typeof medications.$inferSelect
export type NewMedication = typeof medications.$inferInsert
export type Category = typeof categories.$inferSelect
export type Reminder = typeof reminders.$inferSelect
export type MedicationScheduleRow = typeof medicationSchedules.$inferSelect
export type DoseEventRow = typeof doseEvents.$inferSelect

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
export type RefreshTokenRow = typeof refreshTokens.$inferSelect
export type NewRefreshTokenRow = typeof refreshTokens.$inferInsert
export type UserDeviceRow = typeof userDevices.$inferSelect
export type NewUserDeviceRow = typeof userDevices.$inferInsert
export type PrescriptionRow = typeof prescriptions.$inferSelect
export type NewPrescriptionRow = typeof prescriptions.$inferInsert
export type CaregiverInviteRow = typeof caregiverInvites.$inferSelect
export type NewCaregiverInviteRow = typeof caregiverInvites.$inferInsert
export type CaregiverLinkRow = typeof caregiverLinks.$inferSelect
export type NewCaregiverLinkRow = typeof caregiverLinks.$inferInsert
export type NotificationDeliveryRow = typeof notificationDeliveries.$inferSelect
export type NewNotificationDeliveryRow =
  typeof notificationDeliveries.$inferInsert
