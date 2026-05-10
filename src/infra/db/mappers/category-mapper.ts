import { Category } from '@/domain/entities/Category'
import { DateUtils } from '@/shared/utils/date-utils'

export class CategoryMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomain(raw: any): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
      color: raw.color,
      createdAt:
        typeof raw.createdAt === 'string'
          ? DateUtils.parse(raw.createdAt, 'createdAt')
          : raw.createdAt,
    })
  }
}
