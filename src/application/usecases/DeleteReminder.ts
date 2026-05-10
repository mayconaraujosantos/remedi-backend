import { inject, injectable } from 'tsyringe'
import type { ReminderRepository } from '@/domain/repositories/ReminderRepository'
import { AppError } from '@/shared/errors/AppError'

@injectable()
export class DeleteReminder {
  constructor(
    @inject('ReminderRepository')
    private readonly reminderRepository: ReminderRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.reminderRepository.findById(id)
    if (!existing) {
      throw new AppError('Reminder not found', 404)
    }

    await this.reminderRepository.delete(id)
  }
}
