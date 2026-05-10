import { inject, injectable } from 'tsyringe'
import { CreateReminder } from '@/application/usecases/CreateReminder'
import type { CreateReminderDTO } from '@/application/dto/CreateReminderDTO'
import { UpdateReminder } from '@/application/usecases/UpdateReminder'
import type { UpdateReminderDTO } from '@/application/dto/UpdateReminderDTO'
import { DeleteReminder } from '@/application/usecases/DeleteReminder'
import { ListReminders } from '@/application/usecases/ListReminders'
import type { ReminderResponseDTO } from '@/application/dto/ReminderResponseDTO'

@injectable()
export class ReminderService {
  constructor(
    @inject(CreateReminder) private readonly createReminder: CreateReminder,
    @inject(UpdateReminder) private readonly updateReminder: UpdateReminder,
    @inject(DeleteReminder) private readonly deleteReminder: DeleteReminder,
    @inject(ListReminders) private readonly listReminders: ListReminders
  ) {}

  async create(data: CreateReminderDTO): Promise<ReminderResponseDTO> {
    return this.createReminder.execute(data)
  }

  async update(data: UpdateReminderDTO): Promise<ReminderResponseDTO> {
    return this.updateReminder.execute(data)
  }

  async delete(id: string): Promise<void> {
    return this.deleteReminder.execute(id)
  }

  async list(): Promise<ReminderResponseDTO[]> {
    return this.listReminders.execute()
  }
}
