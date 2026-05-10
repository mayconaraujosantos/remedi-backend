export interface CreateMedicationDTO {
  name: string
  description?: string
  dosage: string
  categoryId?: string
  schedule: {
    type: 'ONCE' | 'DAILY' | 'WEEKLY' | 'INTERVAL'
    times: string[]
    intervalHours?: number
    daysOfWeek?: number[]
    startDate: Date
    endDate?: Date
  }
}
