import {
  MedicationSchedule,
  ScheduleType,
} from '@/domain/entities/MedicationSchedule'
import type { MedicationScheduleRow } from '../schema/schema'

export class MedicationScheduleMapper {
  static toDomain(raw: MedicationScheduleRow): MedicationSchedule {
    return new MedicationSchedule({
      id: raw.id,
      medicationId: raw.medicationId,
      type: raw.type as ScheduleType,
      intervalHours: raw.intervalHours ?? undefined,
      daysOfWeek: raw.daysOfWeek ?? undefined,
      times: raw.times,
      startDate: raw.startDate,
      endDate: raw.endDate ?? undefined,
    })
  }

  static toPersistence(domain: MedicationSchedule): MedicationScheduleRow {
    return {
      id: domain.id,
      medicationId: domain.medicationId,
      type: domain.type,
      intervalHours: domain.intervalHours ?? null,
      daysOfWeek: domain.daysOfWeek ?? null,
      times: domain.times,
      startDate: domain.startDate,
      endDate: domain.endDate ?? null,
    }
  }
}
