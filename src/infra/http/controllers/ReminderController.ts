// import { inject, injectable } from 'tsyringe'
// import { ReminderService } from '@/application/services/ReminderService.js'
// import type { CreateReminderDTO } from '@/application/dto/CreateReminderDTO'
// import type { UpdateReminderDTO } from '@/application/dto/UpdateReminderDTO'
// import { ReminderMapper } from '@/infra/db/mappers/reminder-mapper'

// @injectable()
// export class ReminderController {
//   constructor(
//     @inject(ReminderService) private readonly reminderService: ReminderService
//   ) {}

//   async create(data: CreateReminderDTO) {
//     const reminder = await this.reminderService.create(data)
//     return ReminderMapper.toDTO(reminder)
//   }

//   async update(data: UpdateReminderDTO) {
//     const reminder = await this.reminderService.update(data)
//     return ReminderMapper.toDTO(reminder)
//   }

//   async delete(id: string) {
//     return this.reminderService.delete(id)
//   }

//   async list() {
//     const reminders = await this.reminderService.list()
//     return reminders.map(ReminderMapper.toDTO)
//   }
// }

// src/infra/http/controllers/ReminderController.ts
import { inject, injectable } from 'tsyringe'
import { CreateReminder } from '@/application/usecases/CreateReminder'
import { UpdateReminder } from '@/application/usecases/UpdateReminder'
import { DeleteReminder } from '@/application/usecases/DeleteReminder'
import { ListReminders } from '@/application/usecases/ListReminders'
import type { CreateReminderDTO } from '@/application/dto/CreateReminderDTO'
import type { UpdateReminderDTO } from '@/application/dto/UpdateReminderDTO'
import { ReminderPresenter } from '@/application/presenters/reminder-presenter'

@injectable()
export class ReminderController {
  constructor(
    @inject(CreateReminder) private readonly createReminder: CreateReminder,
    @inject(UpdateReminder) private readonly updateReminder: UpdateReminder,
    @inject(DeleteReminder) private readonly deleteReminder: DeleteReminder,
    @inject(ListReminders) private readonly listReminders: ListReminders
  ) {}

  async create(data: CreateReminderDTO) {
    const reminder = await this.createReminder.execute(data)
    return ReminderPresenter.toHTTP(reminder)
  }

  async update(id: string, data: UpdateReminderDTO) {
    const reminder = await this.updateReminder.execute({ ...data, id })
    return ReminderPresenter.toHTTP(reminder)
  }

  async delete(id: string) {
    await this.deleteReminder.execute(id)
  }

  async list() {
    const reminders = await this.listReminders.execute()
    return ReminderPresenter.toHTTPList(reminders)
  }
}
