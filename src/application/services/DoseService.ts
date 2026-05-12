import { inject, injectable } from 'tsyringe'
import { MarkDoseAsTaken } from '../usecases/MarkDoseAsTaken'
import { MarkDoseAsSkipped } from '../usecases/MarkDoseAsSkipped'
import { ListMedicationDoses } from '../usecases/ListMedicationDoses'
import { RegisterAdHocDose } from '../usecases/RegisterAdHocDose'

import type { DoseEventResponseDTO } from '../dto/DoseEventResponseDTO'

@injectable()
export class DoseService {
  constructor(
    @inject(MarkDoseAsTaken)
    private readonly markAsTakenUseCase: MarkDoseAsTaken,
    @inject(MarkDoseAsSkipped)
    private readonly markAsSkippedUseCase: MarkDoseAsSkipped,
    @inject(ListMedicationDoses)
    private readonly listMedicationDosesUseCase: ListMedicationDoses,
    @inject(RegisterAdHocDose)
    private readonly registerAdHocDoseUseCase: RegisterAdHocDose
  ) {}

  async registerAdHoc(medicationId: string) {
    return this.registerAdHocDoseUseCase.execute(medicationId)
  }

  async markAsTaken(doseId: string): Promise<void> {
    return this.markAsTakenUseCase.execute(doseId)
  }

  async markAsSkipped(doseId: string): Promise<void> {
    return this.markAsSkippedUseCase.execute(doseId)
  }

  async listByMedication(
    medicationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DoseEventResponseDTO[]> {
    return this.listMedicationDosesUseCase.execute(
      medicationId,
      startDate,
      endDate
    )
  }
}
