import { z } from 'zod'

export const medicationFrequencySchema = z.enum([
  'once',
  'daily',
  'twice_daily',
  'every_other_day',
  'weekly',
  'custom',
])

export const scheduleTypeSchema = z.enum([
  'ONCE',
  'DAILY',
  'WEEKLY',
  'INTERVAL',
])

export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required'),
  categoryId: z.string().optional(),
  schedule: z.object({
    type: scheduleTypeSchema,
    times: z.array(
      z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
    ),
    intervalHours: z.number().int().positive().optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    startDate: z.string().pipe(z.coerce.date()),
    endDate: z.string().pipe(z.coerce.date()).optional(),
  }),
})
