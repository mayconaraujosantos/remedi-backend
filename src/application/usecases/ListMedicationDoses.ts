import { inject, injectable } from 'tsyringe'
import type { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import type { DoseEventResponseDTO } from '@/application/dto/DoseEventResponseDTO'
import { DoseEventMapper } from '@/application/mappers/dose-event-mapper'

@injectable()
export class ListMedicationDoses {
  constructor(
    @inject('DoseEventRepository')
    private readonly doseEventRepository: DoseEventRepository
  ) {}

  async execute(
    medicationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DoseEventResponseDTO[]> {
    const doses = await this.doseEventRepository.findByMedicationId(
      medicationId,
      startDate,
      endDate
    )
    return doses.map(DoseEventMapper.toDTO)
  }
}
