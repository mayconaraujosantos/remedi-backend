import { Medication } from '@/domain/entities/Medication'
import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'

export class MedicationMapper {
  static toDTO(domain: Medication): MedicationResponseDTO {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      dosage: domain.dosage.toString(),
      frequency: domain.frequency,
      startDate: domain.timeRange.startDate.toISOString(),
      endDate: domain.timeRange.endDate?.toISOString(),
      nextDoseAt: domain.nextDoseAt.toISOString(),
      categoryId: domain.categoryId,
      active: domain.active,
      createdAt: domain.createdAt.toISOString(),
    }
  }

  static toDomain(dto: any): Medication {
    // Implementar se necessário converter de DTO para Domínio
    // Geralmente o UseCase já recebe os dados e cria a entidade
    throw new Error('Not implemented')
  }
}
