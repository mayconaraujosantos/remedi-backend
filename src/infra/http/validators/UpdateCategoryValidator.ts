import { z } from 'zod'

export const updateCategorySchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string().min(1, 'Name is required').optional(),
  color: z.string().optional(),
})
