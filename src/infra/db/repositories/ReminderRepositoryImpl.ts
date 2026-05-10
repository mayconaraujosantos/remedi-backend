import Reminder from '@/domain/entities/Reminder'
import type { ReminderRepository } from '@/domain/repositories/ReminderRepository'

export class ReminderRepositoryImpl implements ReminderRepository {
  private readonly items = new Map<string, Reminder>()

  update(reminder: Reminder): Promise<void> {
    if (!this.items.has(reminder.id)) {
      throw new Error(`Reminder with id ${reminder.id} not found`)
    }
    this.items.set(reminder.id, reminder)
    return Promise.resolve()
  }
  delete(id: string): Promise<void> {
    if (!this.items.has(id)) {
      throw new Error(`Reminder with id ${id} not found`)
    }
    this.items.delete(id)
    return Promise.resolve()
  }

  async create(reminder: Reminder): Promise<void> {
    this.items.set(reminder.id, reminder)
  }

  async findById(id: string): Promise<Reminder | null> {
    return this.items.get(id) ?? null
  }

  async list(): Promise<Reminder[]> {
    return Array.from(this.items.values())
  }
}
