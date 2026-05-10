import { inject, injectable } from 'tsyringe'
import { CreateCategory } from '@/application/usecases/CreateCategory'
import type { CreateCategoryDTO } from '@/application/dto/CreateCategoryDTO'
import { UpdateCategory } from '@/application/usecases/UpdateCategory'
import type { UpdateCategoryDTO } from '@/application/dto/UpdateCategoryDTO'
import { DeleteCategory } from '@/application/usecases/DeleteCategory'
import { ListCategories } from '@/application/usecases/ListCategories'
import type { CategoryResponseDTO } from '@/application/dto/CategoryResponseDTO'

@injectable()
export class CategoryService {
  constructor(
    @inject(CreateCategory) private readonly createCategory: CreateCategory,
    @inject(UpdateCategory) private readonly updateCategory: UpdateCategory,
    @inject(DeleteCategory) private readonly deleteCategory: DeleteCategory,
    @inject(ListCategories) private readonly listCategories: ListCategories
  ) {}

  async create(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {
    return this.createCategory.execute(data)
  }

  async update(data: UpdateCategoryDTO): Promise<CategoryResponseDTO> {
    return this.updateCategory.execute(data)
  }

  async delete(id: string): Promise<void> {
    return this.deleteCategory.execute(id)
  }

  async list(): Promise<CategoryResponseDTO[]> {
    return this.listCategories.execute()
  }
}
export default CategoryService
