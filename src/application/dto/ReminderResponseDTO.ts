export interface ReminderResponseDTO {
  id: string
  title: string
  description?: string
  dueDate: string
  createdAt: string
  completed: boolean
}
