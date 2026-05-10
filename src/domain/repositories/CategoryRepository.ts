import { Category } from '@/domain/entities/Category'

export interface CategoryRepository {
  create(category: Category): Promise<void>
  findById(id: string): Promise<Category | null>
  update(category: Category): Promise<void>
  delete(id: string): Promise<void>
  list(): Promise<Category[]>
}
