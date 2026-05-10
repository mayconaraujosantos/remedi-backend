export type DoseStatus = 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED'

export interface DoseEventProps {
  id?: string
  medicationId: string
  scheduledAt: Date
  takenAt?: Date
  skippedAt?: Date
  status?: DoseStatus
}

export class DoseEvent {
  public readonly id: string
  public readonly medicationId: string
  public readonly scheduledAt: Date
  public takenAt?: Date
  public skippedAt?: Date
  public status: DoseStatus

  constructor(props: DoseEventProps) {
    this.id = props.id ?? crypto.randomUUID()
    this.medicationId = props.medicationId
    this.scheduledAt = props.scheduledAt
    this.takenAt = props.takenAt
    this.skippedAt = props.skippedAt
    this.status = props.status ?? 'PENDING'
  }

  public markAsTaken(date: Date = new Date()): void {
    this.takenAt = date
    this.status = 'TAKEN'
  }

  public markAsSkipped(date: Date = new Date()): void {
    this.skippedAt = date
    this.status = 'SKIPPED'
  }

  public markAsMissed(): void {
    if (this.status === 'PENDING') {
      this.status = 'MISSED'
    }
  }
}
