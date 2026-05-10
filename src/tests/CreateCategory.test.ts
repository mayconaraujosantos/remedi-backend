import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCategory } from '@/application/usecases/CreateCategory'
import { CategoryRepositoryDrizzle } from '@/infra/db/CategoryRepositoryDrizzle'

describe('CreateCategory', () => {
  let createCategory: CreateCategory
  let repository: CategoryRepositoryDrizzle

  beforeEach(() => {
    repository = new CategoryRepositoryDrizzle()
    createCategory = new CreateCategory(repository)
  })

  it('should create a category', async () => {
    const data = {
      name: 'Medication',
      color: '#1E90FF',
    }

    const category = await createCategory.execute(data)

    expect(category.name).toBe('Medication')
    expect(category.color).toBe('#1E90FF')
  })
})
