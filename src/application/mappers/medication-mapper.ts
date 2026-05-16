import { Medication } from '@/domain/entities/Medication'
import { MedicationSchedule } from '@/domain/entities/MedicationSchedule'
import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'

export class MedicationMapper {
  static toDTO(
    domain: Medication,
    schedule?: MedicationSchedule | null
  ): MedicationResponseDTO {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      dosage: domain.dosage.toString(),
      categoryId: domain.categoryId,
      active: domain.active,
      createdAt: domain.createdAt.toISOString(),
      schedule: schedule
        ? {
            type: schedule.type,
            times: schedule.times,
            intervalHours: schedule.intervalHours,
            daysOfWeek: schedule.daysOfWeek,
            startDate: schedule.startDate.toISOString(),
            endDate: schedule.endDate?.toISOString(),
          }
        : undefined,
    }
  }

  static toDomain(): Medication {
    throw new Error('Not implemented')
  }
}
