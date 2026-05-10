import Reminder from '@/domain/entities/Reminder'

export interface ReminderRepository {
  create(reminder: Reminder): Promise<void>
  findById(id: string): Promise<Reminder | null>
  update(reminder: Reminder): Promise<void>
  delete(id: string): Promise<void>
  list(): Promise<Reminder[]>
}
