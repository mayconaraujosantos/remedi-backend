import { randomUUID } from 'node:crypto'
import { AppError } from '@/shared/errors/AppError'

export interface CategoryProps {
  id?: string
  name: string
  color?: string | null
  createdAt: Date
}

export class Category {
  public readonly id: string
  public readonly name: string
  public readonly color: string | null
  public readonly createdAt: Date

  constructor(props: CategoryProps) {
    this.id = props.id ?? randomUUID()
    this.name = props.name.trim()
    this.color = props.color ?? null
    this.createdAt = props.createdAt ?? new Date()
  }

  public static create(name: string, color?: string | null): Category {
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new AppError('Category name cannot be empty', 400)
    }

    return new Category({
      name: trimmedName,
      color: color ?? null,
      createdAt: new Date(),
    })
  }
}
