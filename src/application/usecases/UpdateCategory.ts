import { inject, injectable } from 'tsyringe'
import { Category } from '@/domain/entities/Category'
import type { CategoryRepository } from '@/domain/repositories/CategoryRepository'
import { AppError } from '@/shared/errors/AppError'
import type { UpdateCategoryDTO } from '@/application/dto/UpdateCategoryDTO'
import type { CategoryResponseDTO } from '@/application/dto/CategoryResponseDTO'
import { CategoryMapper } from '@/application/mappers/category-mapper'

@injectable()
export class UpdateCategory {
  constructor(
    @inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(data: UpdateCategoryDTO): Promise<CategoryResponseDTO> {
    const existing = await this.categoryRepository.findById(data.id)
    if (!existing) {
      throw new AppError('Category not found', 404)
    }

    const updated = new Category({
      id: existing.id,
      name: data.name ?? existing.name,
      color: data.color ?? existing.color,
      createdAt: existing.createdAt,
    })

    await this.categoryRepository.update(updated)
    return CategoryMapper.toDTO(updated)
  }
}
