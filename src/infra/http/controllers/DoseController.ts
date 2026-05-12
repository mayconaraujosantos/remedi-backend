import { inject, injectable } from 'tsyringe'
import { DoseService } from '@/application/services/DoseService'
import { DateUtils } from '@/shared/utils/date-utils'

@injectable()
export class DoseController {
  constructor(
    @inject(DoseService)
    private readonly doseService: DoseService
  ) {}

  async markAsTaken(id: string) {
    await this.doseService.markAsTaken(id)
    return { message: 'Dose marked as taken' }
  }

  async markAsSkipped(id: string) {
    await this.doseService.markAsSkipped(id)
    return { message: 'Dose marked as skipped' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async listByMedication(medicationId: string, query: any) {
    const startDate = query.startDate
      ? DateUtils.parse(query.startDate, 'startDate')
      : undefined
    const endDate = query.endDate
      ? DateUtils.parse(query.endDate, 'endDate')
      : undefined

    return this.doseService.listByMedication(medicationId, startDate, endDate)
  }

  async registerAdHoc(medicationId: string) {
    const dose = await this.doseService.registerAdHoc(medicationId)
    return { message: 'Ad-hoc dose registered', dose }
  }
}
