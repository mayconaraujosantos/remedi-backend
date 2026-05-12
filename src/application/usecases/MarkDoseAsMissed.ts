import { inject, injectable } from 'tsyringe'
import type { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import { logger } from '@/shared/utils/logger'
import { trackDoseMissed } from '@/shared/utils/metrics'

@injectable()
export class MarkDoseAsMissed {
  constructor(
    @inject('DoseEventRepository')
    private readonly doseEventRepository: DoseEventRepository
  ) {}

  async execute(doseId: string): Promise<void> {
    const dose = await this.doseEventRepository.findById(doseId)

    if (!dose) return

    if (dose.status === 'PENDING') {
      dose.markAsMissed()
      await this.doseEventRepository.update(dose)
      logger.info(`[MarkDoseAsMissed] Dose ${doseId} marked as MISSED`)
      trackDoseMissed()
    }
  }
}
