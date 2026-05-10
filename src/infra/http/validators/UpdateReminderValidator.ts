import { z } from 'zod'

export const updateReminderSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  completed: z.boolean().optional(),
})

export type UpdateReminderInput = z.infer<typeof updateReminderSchema>
