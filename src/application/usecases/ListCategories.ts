import { inject, injectable } from 'tsyringe'
import type { CategoryRepository } from '@/domain/repositories/CategoryRepository'
import type { CategoryResponseDTO } from '@/application/dto/CategoryResponseDTO'
import { CategoryMapper } from '@/application/mappers/category-mapper'

@injectable()
export class ListCategories {
  constructor(
    @inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(): Promise<CategoryResponseDTO[]> {
    const categories = await this.categoryRepository.list()
    return categories.map((c) => CategoryMapper.toDTO(c))
  }
}
