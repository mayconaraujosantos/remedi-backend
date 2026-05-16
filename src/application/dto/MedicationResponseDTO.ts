export interface MedicationResponseDTO {
  id: string
  name: string
  description?: string
  dosage: string
  categoryId?: string
  active: boolean
  createdAt: string
  schedule?: {
    type: string
    times: string[]
    intervalHours?: number
    daysOfWeek?: number[]
    startDate: string
    endDate?: string
  }
}
