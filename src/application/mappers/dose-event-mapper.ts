import { DoseEvent } from '@/domain/entities/DoseEvent'
import type { DoseEventResponseDTO } from '../dto/DoseEventResponseDTO'

export class DoseEventMapper {
  static toDTO(domain: DoseEvent): DoseEventResponseDTO {
    return {
      id: domain.id,
      medicationId: domain.medicationId,
      scheduledAt: domain.scheduledAt,
      takenAt: domain.takenAt,
      skippedAt: domain.skippedAt,
      status: domain.status,
    }
  }
}
