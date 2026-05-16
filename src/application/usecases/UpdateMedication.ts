import { inject, injectable } from 'tsyringe'
import { Medication } from '@/domain/entities/Medication'
import type { MedicationRepository } from '@/domain/repositories/MedicationRepository'
import type { MedicationScheduleRepository } from '@/domain/repositories/MedicationScheduleRepository'
import { AppError } from '@/shared/errors/AppError'
import type { UpdateMedicationDTO } from '@/application/dto/UpdateMedicationDTO'
import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'
import { MedicationMapper } from '@/application/mappers/medication-mapper'
import { Dosage } from '@/domain/value-objects/Dosage'

@injectable()
export class UpdateMedication {
  constructor(
    @inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @inject('MedicationScheduleRepository')
    private readonly scheduleRepository: MedicationScheduleRepository
  ) {}

  async execute(data: UpdateMedicationDTO): Promise<MedicationResponseDTO> {
    const existing = await this.medicationRepository.findById(data.id)
    if (!existing) {
      throw new AppError('Medication not found', 404)
    }

    const updated = new Medication({
      id: existing.id,
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      dosage: data.dosage ? new Dosage(data.dosage) : existing.dosage,
      categoryId: data.categoryId ?? existing.categoryId,
      active: data.active ?? existing.active,
      createdAt: existing.createdAt,
    })

    await this.medicationRepository.update(updated)

    const schedule = await this.scheduleRepository.findByMedicationId(updated.id)
    return MedicationMapper.toDTO(updated, schedule)
  }
}
