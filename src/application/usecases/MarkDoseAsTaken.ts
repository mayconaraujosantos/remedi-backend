import { inject, injectable } from 'tsyringe'
import type { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import { AppError } from '@/shared/errors/AppError'
import { trackDoseTaken } from '@/shared/utils/metrics'

@injectable()
export class MarkDoseAsTaken {
  constructor(
    @inject('DoseEventRepository')
    private readonly doseEventRepository: DoseEventRepository
  ) {}

  async execute(doseId: string): Promise<void> {
    const dose = await this.doseEventRepository.findById(doseId)

    if (!dose) {
      throw new AppError('Dose event not found', 404)
    }

    if (dose.status !== 'PENDING') {
      throw new AppError(
        `Cannot mark dose as taken. Current status: ${dose.status}`,
        400
      )
    }

    dose.markAsTaken()
    await this.doseEventRepository.update(dose)
    trackDoseTaken('planned')
  }
}
