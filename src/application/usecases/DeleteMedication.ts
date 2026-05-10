import { inject, injectable } from 'tsyringe'
import type { MedicationRepository } from '@/domain/repositories/MedicationRepository'
import { AppError } from '@/shared/errors/AppError'

@injectable()
export class DeleteMedication {
  constructor(
    @inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.medicationRepository.findById(id)
    if (!existing) {
      throw new AppError('Medication not found', 404)
    }

    existing.markInactive()
    await this.medicationRepository.update(existing)

  }
}
