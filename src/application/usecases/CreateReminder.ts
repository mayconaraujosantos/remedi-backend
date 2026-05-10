import { inject, injectable } from 'tsyringe'
import Reminder from '@/domain/entities/Reminder'
import type { ReminderRepository } from '@/domain/repositories/ReminderRepository'
import { AppError } from '@/shared/errors/AppError'
import type { CreateReminderDTO } from '@/application/dto/CreateReminderDTO'
import type { ReminderResponseDTO } from '@/application/dto/ReminderResponseDTO'
import { ReminderMapper } from '@/application/mappers/reminder-mapper'

@injectable()
export class CreateReminder {
  constructor(
    @inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository
  ) {}

  async execute(data: CreateReminderDTO): Promise<ReminderResponseDTO> {
    if (
      !(data.dueDate instanceof Date) ||
      Number.isNaN(data.dueDate.getTime())
    ) {
      throw new AppError('Invalid dueDate', 400)
    }

    const reminder = new Reminder({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      createdAt: new Date(),
    })

    await this.reminderRepository.create(reminder)

    return ReminderMapper.toDTO(reminder)
  }
}
