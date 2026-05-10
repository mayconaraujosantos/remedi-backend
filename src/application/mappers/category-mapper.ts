import { Category } from '@/domain/entities/Category'
import type { CategoryResponseDTO } from '@/application/dto/CategoryResponseDTO'

export class CategoryMapper {
  static toDTO(domain: Category): CategoryResponseDTO {
    return {
      id: domain.id,
      name: domain.name,
      color: domain.color ?? undefined,
      createdAt: domain.createdAt.toISOString(),
    }
  }
}
