import { z } from 'zod'

export const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
  }, z.date()),
})

export type CreateReminderInput = z.infer<typeof createReminderSchema>
