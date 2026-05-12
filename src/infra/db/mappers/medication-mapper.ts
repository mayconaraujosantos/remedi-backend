import { Medication } from '@/domain/entities/Medication'
import { Dosage } from '@/domain/value-objects/Dosage'
import type { Medication as MedicationRow } from '../schema/schema'

export class MedicationMapper {
  static toDomain(raw: MedicationRow): Medication {
    return new Medication({
      id: raw.id,
      name: raw.name,
      description: raw.description ?? undefined,
      dosage: new Dosage(raw.dosage),
      categoryId: raw.categoryId ?? undefined,
      active: raw.active,
      createdAt: raw.createdAt,
    })
  }

  static toPersistence(domain: Medication): MedicationRow {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description ?? null,
      dosage: domain.dosage.value,
      categoryId: domain.categoryId ?? null,
      active: domain.active,
      createdAt: domain.createdAt,
      // Temporal fields now managed by MedicationSchedule
      frequency: '',
      startDate: new Date(),
      nextDoseAt: new Date(),
      endDate: null,
    }
  }
}
