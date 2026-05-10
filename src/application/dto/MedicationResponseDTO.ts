import type { MedicationFrequency } from '@/domain/entities/Medication'

export interface MedicationResponseDTO {
  id: string
  name: string
  description?: string
  dosage: string
  frequency: MedicationFrequency
  startDate: string
  endDate?: string
  nextDoseAt: string
  categoryId?: string
  active: boolean
  createdAt: string
}
