import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { config } from '@/main/config/config.js'

const queryClient = postgres(config.database.url!)

// Executar o DDL inicial (Migrações manuais)
await queryClient`
  CREATE TABLE IF NOT EXISTS Medication (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP,
    nextDoseAt TIMESTAMP NOT NULL,
    categoryId VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS Reminder (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TIMESTAMP NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    completed BOOLEAN NOT NULL DEFAULT FALSE
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS Category (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS MedicationSchedule (
    id VARCHAR(255) PRIMARY KEY,
    medicationId VARCHAR(255) NOT NULL,
    type TEXT NOT NULL,
    intervalHours INTEGER,
    daysOfWeek INTEGER[],
    times TEXT[] NOT NULL,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS DoseEvent (
    id VARCHAR(255) PRIMARY KEY,
    medicationId VARCHAR(255) NOT NULL,
    scheduledAt TIMESTAMP NOT NULL,
    takenAt TIMESTAMP,
    skippedAt TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'PENDING'
  )
`

export const db = drizzle(queryClient)
