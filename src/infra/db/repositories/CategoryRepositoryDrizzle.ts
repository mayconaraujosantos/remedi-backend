import { injectable } from 'tsyringe'
import { db } from '@/infra/db/database'
import { eq } from 'drizzle-orm'
import { categories } from '@/infra/db/schema/schema'
import { Category } from '@/domain/entities/Category'
import type { CategoryRepository } from '@/domain/repositories/CategoryRepository'
import { CategoryMapper } from '@/infra/db/mappers/category-mapper'

@injectable()
export class CategoryRepositoryDrizzle implements CategoryRepository {
  async create(category: Category): Promise<void> {
    await db.insert(categories).values({
      id: category.id,
      name: category.name,
      color: category.color,
      createdAt: category.createdAt,
    })
  }

  async findById(id: string): Promise<Category | null> {
    const [data] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    if (!data) return null

    return CategoryMapper.toDomain(data)
  }

  async update(category: Category): Promise<void> {
    await db
      .update(categories)
      .set({
        name: category.name,
        color: category.color,
      })
      .where(eq(categories.id, category.id))
  }

  async delete(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id))
  }

  async list(): Promise<Category[]> {
    const rows = await db.select().from(categories)
    return rows.map((row) => CategoryMapper.toDomain(row))
  }
}
