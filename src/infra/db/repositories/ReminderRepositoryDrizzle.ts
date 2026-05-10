import Reminder from '@/domain/entities/Reminder'
import { ReminderRepository } from '@/domain/repositories/ReminderRepository'
import { db } from '@/infra/db/database'
import { injectable } from 'tsyringe'
import { reminders } from '@/infra/db/schema/schema'
import { eq } from 'drizzle-orm'
import { ReminderMapper } from '@/infra/db/mappers/reminder-mapper'

@injectable()
export class ReminderRepositoryDrizzle implements ReminderRepository {
  async create(reminder: Reminder): Promise<void> {
    await db.insert(reminders).values({
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      dueDate: reminder.dueDate,
      createdAt: reminder.createdAt,
      completed: reminder.completed,
    })
  }

  async findById(id: string): Promise<Reminder | null> {
    const [data] = await db
      .select()
      .from(reminders)
      .where(eq(reminders.id, id))
      .limit(1)
    if (!data) return null
    return ReminderMapper.toDomain(data)
  }

  async update(reminder: Reminder): Promise<void> {
    await db
      .update(reminders)
      .set({
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.dueDate,
        completed: reminder.completed,
      })
      .where(eq(reminders.id, reminder.id))
  }

  async delete(id: string): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id))
  }

  async list(): Promise<Reminder[]> {
    const data = await db.select().from(reminders)
    return data.map((row) => ReminderMapper.toDomain(row))
  }
}
