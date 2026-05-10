import { pgTable, text, integer, timestamp, varchar, boolean } from 'drizzle-orm/pg-core'

export const medications = pgTable('Medication', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(), // 'once', 'daily', etc
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  nextDoseAt: timestamp('nextDoseAt').notNull(),
  categoryId: varchar('categoryId', { length: 255 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const categories = pgTable('Category', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const reminders = pgTable('Reminder', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('dueDate').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  completed: boolean('completed').notNull().default(false),
})

export const medicationSchedules = pgTable('MedicationSchedule', {
  id: varchar('id', { length: 255 }).primaryKey(),
  medicationId: varchar('medicationId', { length: 255 }).notNull(),
  type: text('type').notNull(), // 'ONCE', 'DAILY', 'WEEKLY', 'INTERVAL'
  intervalHours: integer('intervalHours'),
  daysOfWeek: integer('daysOfWeek').array(),
  times: text('times').array().notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
})

export const doseEvents = pgTable('DoseEvent', {
  id: varchar('id', { length: 255 }).primaryKey(),
  medicationId: varchar('medicationId', { length: 255 }).notNull(),
  scheduledAt: timestamp('scheduledAt').notNull(),
  takenAt: timestamp('takenAt'),
  skippedAt: timestamp('skippedAt'),
  status: text('status').notNull().default('PENDING'),
})

// Export types para usar no código
export type Medication = typeof medications.$inferSelect
export type NewMedication = typeof medications.$inferInsert
export type Category = typeof categories.$inferSelect
export type Reminder = typeof reminders.$inferSelect
export type MedicationScheduleRow = typeof medicationSchedules.$inferSelect
export type DoseEventRow = typeof doseEvents.$inferSelect
