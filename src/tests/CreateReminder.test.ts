import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import {CreateReminder} from "../application/usecases/CreateReminder";
import {ReminderRepositoryDrizzle} from "../infra/db/repositories/ReminderRepositoryDrizzle";


describe('CreateReminder', () => {
  let createReminder: CreateReminder
  let repository: ReminderRepositoryDrizzle

  beforeEach(() => {
    repository = new ReminderRepositoryDrizzle()
    createReminder = new CreateReminder(repository)
  })

  it('should create a reminder', async () => {
    const data = {
      title: 'Test Reminder',
      description: 'Test Description',
      dueDate: new Date('2026-05-10T10:00:00Z'),
    }

    const reminder = await createReminder.execute(data)

    expect(reminder.title).toBe('Test Reminder')
    expect(reminder.description).toBe('Test Description')
    expect(reminder.dueDate).toEqual(new Date('2026-05-10T10:00:00Z'))
    expect(reminder.completed).toBe(false)
  })
})
