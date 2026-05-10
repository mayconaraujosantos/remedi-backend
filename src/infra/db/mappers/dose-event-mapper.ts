import { DoseEvent, DoseStatus } from '@/domain/entities/DoseEvent'
import type { DoseEventRow } from '../schema/schema'

export class DoseEventMapper {
  static toDomain(raw: DoseEventRow): DoseEvent {
    return new DoseEvent({
      id: raw.id,
      medicationId: raw.medicationId,
      scheduledAt: raw.scheduledAt,
      takenAt: raw.takenAt ?? undefined,
      skippedAt: raw.skippedAt ?? undefined,
      status: raw.status as DoseStatus,
    })
  }

  static toPersistence(domain: DoseEvent): DoseEventRow {
    return {
      id: domain.id,
      medicationId: domain.medicationId,
      scheduledAt: domain.scheduledAt,
      takenAt: domain.takenAt ?? null,
      skippedAt: domain.skippedAt ?? null,
      status: domain.status,
    }
  }
}
