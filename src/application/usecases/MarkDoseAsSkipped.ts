import { inject, injectable } from 'tsyringe'
import type { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import { AppError } from '@/shared/errors/AppError'

@injectable()
export class MarkDoseAsSkipped {
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
      throw new AppError(`Cannot mark dose as skipped. Current status: ${dose.status}`, 400)
    }

    dose.markAsSkipped()
    await this.doseEventRepository.update(dose)
  }
}
