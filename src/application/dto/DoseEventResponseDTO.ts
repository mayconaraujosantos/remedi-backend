export interface DoseEventResponseDTO {
  id: string
  medicationId: string
  scheduledAt: Date
  takenAt?: Date
  skippedAt?: Date
  status: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED'
}
