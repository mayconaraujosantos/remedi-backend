import type { MedicationFrequency } from '@/domain/entities/Medication'

export interface UpdateMedicationDTO {
  id: string
  name?: string
  description?: string
  dosage?: string
  frequency?: MedicationFrequency
  startDate?: Date
  endDate?: Date
  nextDoseAt?: Date
  categoryId?: string
  active?: boolean
}
