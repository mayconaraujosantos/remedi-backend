import { inject, injectable } from 'tsyringe'
import type {
  MedicationListFilters,
  MedicationRepository,
} from '@/domain/repositories/MedicationRepository'
import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'
import { MedicationMapper } from '@/application/mappers/medication-mapper'

@injectable()
export class ListMedications {
  constructor(
    @inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository
  ) {}

  async execute(
    filters?: MedicationListFilters
  ): Promise<MedicationResponseDTO[]> {
    const medications = await this.medicationRepository.list({
      status: 'active',
      ...filters,
    })

    return medications.map((m) => MedicationMapper.toDTO(m))
  }
}
