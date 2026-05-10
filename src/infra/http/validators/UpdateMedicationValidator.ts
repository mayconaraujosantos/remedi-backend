import { z } from 'zod'
import { medicationFrequencySchema } from '@/infra/http/validators/CreateMedicationValidator'

export const updateMedicationSchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required').optional(),
  frequency: medicationFrequencySchema.optional(),
  startDate: z
    .string()
    .datetime({ message: 'Invalid start date format' })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'Invalid end date format' })
    .optional(),
  nextDoseAt: z
    .string()
    .datetime({ message: 'Invalid next dose date format' })
    .optional(),
  categoryId: z.string().optional(),
  active: z.boolean().optional(),
})
