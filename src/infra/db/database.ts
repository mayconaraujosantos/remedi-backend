import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { config } from '@/main/config/config.js'

const queryClient = postgres(config.database.url!)

// Executar o DDL inicial (Migrações manuais em snake_case)
await queryClient`
  CREATE TABLE IF NOT EXISTS medication (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    next_dose_at TIMESTAMP NOT NULL,
    category_id VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS reminder (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed BOOLEAN NOT NULL DEFAULT FALSE
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS category (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS medicationschedule (
    id VARCHAR(255) PRIMARY KEY,
    medication_id VARCHAR(255) NOT NULL,
    type TEXT NOT NULL,
    interval_hours INTEGER,
    days_of_week INTEGER[],
    times TEXT[] NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP
  )
`

await queryClient`
  CREATE TABLE IF NOT EXISTS doseevent (
    id VARCHAR(255) PRIMARY KEY,
    medication_id VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    taken_at TIMESTAMP,
    skipped_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'PENDING'
  )
`

export const db = drizzle(queryClient)
