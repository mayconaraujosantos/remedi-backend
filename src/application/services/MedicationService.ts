import { inject, injectable } from 'tsyringe'
import { CreateMedication } from '@/application/usecases/CreateMedication'
import type { CreateMedicationDTO } from '@/application/dto/CreateMedicationDTO'
import { UpdateMedication } from '@/application/usecases/UpdateMedication'
import type { UpdateMedicationDTO } from '@/application/dto/UpdateMedicationDTO'
import { DeleteMedication } from '@/application/usecases/DeleteMedication'
import { ListMedications } from '@/application/usecases/ListMedications'
import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'

@injectable()
export class MedicationService {
  constructor(
    @inject(CreateMedication)
    private readonly createMedication: CreateMedication,
    @inject(UpdateMedication)
    private readonly updateMedication: UpdateMedication,
    @inject(DeleteMedication)
    private readonly deleteMedication: DeleteMedication,
    @inject(ListMedications) private readonly listMedications: ListMedications
  ) {}

  async create(data: CreateMedicationDTO): Promise<MedicationResponseDTO> {
    return this.createMedication.execute(data)
  }

  async update(data: UpdateMedicationDTO): Promise<MedicationResponseDTO> {
    return this.updateMedication.execute(data)
  }

  async delete(id: string): Promise<void> {
    return this.deleteMedication.execute(id)
  }

  async list(
    filters?: Parameters<ListMedications['execute']>[0]
  ): Promise<MedicationResponseDTO[]> {
    return this.listMedications.execute(filters)
  }
}
