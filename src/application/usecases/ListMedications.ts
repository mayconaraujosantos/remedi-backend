import { inject, injectable } from 'tsyringe'
import type {
  MedicationListFilters,
  MedicationRepository,
} from '@/domain/repositories/MedicationRepository'
import type { MedicationScheduleRepository } from '@/domain/repositories/MedicationScheduleRepository'
import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'
import { MedicationMapper } from '@/application/mappers/medication-mapper'

@injectable()
export class ListMedications {
  constructor(
    @inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @inject('MedicationScheduleRepository')
    private readonly scheduleRepository: MedicationScheduleRepository
  ) {}

  async execute(
    filters?: MedicationListFilters
  ): Promise<MedicationResponseDTO[]> {
    const medications = await this.medicationRepository.list({
      status: 'active',
      ...filters,
    })

    return Promise.all(
      medications.map(async (m) => {
        const schedule = await this.scheduleRepository.findByMedicationId(m.id)
        return MedicationMapper.toDTO(m, schedule)
      })
    )
  }
}
