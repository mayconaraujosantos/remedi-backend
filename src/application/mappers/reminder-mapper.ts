import Reminder from '@/domain/entities/Reminder'
import type { ReminderResponseDTO } from '@/application/dto/ReminderResponseDTO'

export class ReminderMapper {
  static toDTO(domain: Reminder): ReminderResponseDTO {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      dueDate: domain.dueDate.toISOString(),
      createdAt: domain.createdAt.toISOString(),
      completed: domain.completed,
    }
  }
}
