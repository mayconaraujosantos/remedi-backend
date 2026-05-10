import { inject, injectable } from 'tsyringe'
import type { ReminderRepository } from '@/domain/repositories/ReminderRepository'
import type { ReminderResponseDTO } from '@/application/dto/ReminderResponseDTO'
import { ReminderMapper } from '@/application/mappers/reminder-mapper'

@injectable()
export class ListReminders {
  constructor(
    @inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository
  ) {}

  async execute(): Promise<ReminderResponseDTO[]> {
    const reminders = await this.reminderRepository.list()
    return reminders.map((r) => ReminderMapper.toDTO(r))
  }
}
