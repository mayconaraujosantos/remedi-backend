import { inject, injectable } from 'tsyringe'
import { DoseEvent } from '@/domain/entities/DoseEvent'
import type { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import type { MedicationRepository } from '@/domain/repositories/MedicationRepository'
import { AppError } from '@/shared/errors/AppError'
import { trackDoseTaken } from '@/shared/utils/metrics'

@injectable()
export class RegisterAdHocDose {
  constructor(
    @inject('DoseEventRepository')
    private readonly doseEventRepository: DoseEventRepository,
    @inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository
  ) {}

  async execute(medicationId: string): Promise<DoseEvent> {
    const medication = await this.medicationRepository.findById(medicationId)
    
    if (!medication) {
      throw new AppError('Medication not found', 404)
    }

    if (!medication.active) {
      throw new AppError('Cannot register dose for inactive medication', 400)
    }

    const now = new Date()
    const dose = new DoseEvent({
      medicationId,
      scheduledAt: now, // Doses ad-hoc são agendadas para "agora"
      status: 'TAKEN',
      takenAt: now,
    })

    await this.doseEventRepository.create(dose)
    trackDoseTaken('adhoc')


    return dose
  }
}
