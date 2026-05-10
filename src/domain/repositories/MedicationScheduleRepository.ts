import { MedicationSchedule } from '../entities/MedicationSchedule'

export interface MedicationScheduleRepository {
  create(schedule: MedicationSchedule): Promise<void>
  update(schedule: MedicationSchedule): Promise<void>
  delete(id: string): Promise<void>
  findById(id: string): Promise<MedicationSchedule | null>
  findByMedicationId(medicationId: string): Promise<MedicationSchedule | null>
}
