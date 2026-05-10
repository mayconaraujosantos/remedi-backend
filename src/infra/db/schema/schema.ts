import { pgTable, text, integer, timestamp, varchar, boolean } from 'drizzle-orm/pg-core'

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
  status: text('status').notNull().default('PENDING'),
})

// Export types para usar no código
export type Medication = typeof medications.$inferSelect
export type NewMedication = typeof medications.$inferInsert
export type Category = typeof categories.$inferSelect
export type Reminder = typeof reminders.$inferSelect
export type MedicationScheduleRow = typeof medicationSchedules.$inferSelect
export type DoseEventRow = typeof doseEvents.$inferSelect
