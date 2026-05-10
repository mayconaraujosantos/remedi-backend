import { inject, injectable } from 'tsyringe'
import type { CategoryRepository } from '@/domain/repositories/CategoryRepository'
import { AppError } from '@/shared/errors/AppError'

@injectable()
export class DeleteCategory {
  constructor(
    @inject('CategoryRepository')
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.categoryRepository.findById(id)
    if (!existing) {
      throw new AppError('Category not found', 404)
    }

    await this.categoryRepository.delete(id)
  }
}
