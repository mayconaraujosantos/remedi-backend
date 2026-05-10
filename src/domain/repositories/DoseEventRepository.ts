import { DoseEvent } from '../entities/DoseEvent'

export interface DoseEventRepository {
  create(event: DoseEvent): Promise<void>
  update(event: DoseEvent): Promise<void>
  findById(id: string): Promise<DoseEvent | null>
  findByMedicationId(medicationId: string, startDate?: Date, endDate?: Date): Promise<DoseEvent[]>
  listPending(): Promise<DoseEvent[]>
}
