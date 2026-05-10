import { inject, injectable } from 'tsyringe'
import Reminder from '@/domain/entities/Reminder'
import type { ReminderRepository } from '@/domain/repositories/ReminderRepository'
import { AppError } from '@/shared/errors/AppError'
import type { UpdateReminderDTO } from '@/application/dto/UpdateReminderDTO'
import type { ReminderResponseDTO } from '@/application/dto/ReminderResponseDTO'
import { ReminderMapper } from '@/application/mappers/reminder-mapper'

@injectable()
export class UpdateReminder {
  constructor(
    @inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository
  ) {}

  async execute(data: UpdateReminderDTO): Promise<ReminderResponseDTO> {
    const existing = await this.reminderRepository.findById(data.id)
    if (!existing) {
      throw new AppError('Reminder not found', 404)
    }

    const updated = new Reminder({
      id: existing.id,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      dueDate: data.dueDate ?? existing.dueDate,
      createdAt: existing.createdAt,
      completed: data.completed ?? existing.completed,
    })

    await this.reminderRepository.update(updated)
    return ReminderMapper.toDTO(updated)
  }
}
