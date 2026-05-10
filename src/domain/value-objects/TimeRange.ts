import { InvalidDateRangeError } from '../errors/InvalidDateRangeError'

export class TimeRange {
  public readonly startDate: Date
  public readonly endDate?: Date

  constructor(startDate: Date, endDate?: Date) {
    if (endDate && endDate < startDate) {
      throw new InvalidDateRangeError()
    }

    this.startDate = startDate
    this.endDate = endDate
  }

  public get durationMs(): number | null {
    if (!this.endDate) return null
    return this.endDate.getTime() - this.startDate.getTime()
  }
}
