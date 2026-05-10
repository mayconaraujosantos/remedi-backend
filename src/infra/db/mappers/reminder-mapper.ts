import Reminder from '@/domain/entities/Reminder'
import { DateUtils } from '@/shared/utils/date-utils'

export class ReminderMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toDomain(raw: any): Reminder {
    return new Reminder({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      dueDate:
        typeof raw.dueDate === 'string'
          ? DateUtils.parse(raw.dueDate, 'dueDate')
          : raw.dueDate,
      createdAt:
        typeof raw.createdAt === 'string'
          ? DateUtils.parse(raw.createdAt, 'createdAt')
          : raw.createdAt,
      completed: Boolean(raw.completed),
    })
  }
}
