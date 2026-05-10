import { inject, injectable } from 'tsyringe'
import { Category } from '@/domain/entities/Category'
import type { CategoryRepository } from '@/domain/repositories/CategoryRepository'
import type { CreateCategoryDTO } from '@/application/dto/CreateCategoryDTO'
import type { CategoryResponseDTO } from '@/application/dto/CategoryResponseDTO'
import { CategoryMapper } from '@/application/mappers/category-mapper'

@injectable()
export class CreateCategory {
  constructor(
    @inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {
    const category = Category.create(data.name, data.color)

    await this.categoryRepository.create(category)
    return CategoryMapper.toDTO(category)
  }
}
