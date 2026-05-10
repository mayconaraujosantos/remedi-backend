import { inject, injectable } from 'tsyringe'
import { CategoryService } from '@/application/services/CategoryService'
import type { CreateCategoryDTO } from '@/application/dto/CreateCategoryDTO'
import type { UpdateCategoryDTO } from '@/application/dto/UpdateCategoryDTO'
import { CategoryPresenter } from '@/application/presenters/category-presenter'

@injectable()
export class CategoryController {
  constructor(
    @inject(CategoryService) private readonly categoryService: CategoryService
  ) {}

  async create(data: CreateCategoryDTO) {
    const category = await this.categoryService.create(data)
    return CategoryPresenter.toHTTP(category)
  }

  async update(data: UpdateCategoryDTO) {
    const category = await this.categoryService.update(data)
    return CategoryPresenter.toHTTP(category)
  }

  async delete(id: string) {
    return this.categoryService.delete(id)
  }

  async list() {
    const categories = await this.categoryService.list()
    return CategoryPresenter.toHTTPList(categories)
  }
}
