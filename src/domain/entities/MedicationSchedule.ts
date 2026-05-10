export type ScheduleType = 'ONCE' | 'DAILY' | 'WEEKLY' | 'INTERVAL'

export interface MedicationScheduleProps {
  id?: string
  medicationId: string
  type: ScheduleType
  intervalHours?: number
  daysOfWeek?: number[] // 0-6 (Sunday-Saturday)
  times: string[] // HH:mm format
  startDate: Date
  endDate?: Date
}

export class MedicationSchedule {
  public readonly id: string
  public readonly medicationId: string
  public readonly type: ScheduleType
  public readonly intervalHours?: number
  public readonly daysOfWeek?: number[]
  public readonly times: string[]
  public readonly startDate: Date
  public readonly endDate?: Date

  constructor(props: MedicationScheduleProps) {
    this.id = props.id ?? crypto.randomUUID()
    this.medicationId = props.medicationId
    this.type = props.type
    this.intervalHours = props.intervalHours
    this.daysOfWeek = props.daysOfWeek
    this.times = props.times
    this.startDate = props.startDate
    this.endDate = props.endDate
  }
}
