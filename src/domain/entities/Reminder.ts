export interface ReminderProps {
  id?: string
  title: string
  description?: string
  dueDate: Date
  createdAt: Date
  completed?: boolean
}

class Reminder {
  public readonly id: string
  public readonly title: string
  public readonly description?: string
  public readonly dueDate: Date
  public readonly createdAt: Date
  public completed: boolean

  constructor(props: ReminderProps) {
    this.id =
      props.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.title = props.title
    this.description = props.description
    this.dueDate = props.dueDate
    this.createdAt = props.createdAt
    this.completed = props.completed ?? false
  }
}

export default Reminder
