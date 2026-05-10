export interface UpdateReminderDTO {
  id: string
  title?: string
  description?: string
  dueDate?: Date
  completed?: boolean
}
