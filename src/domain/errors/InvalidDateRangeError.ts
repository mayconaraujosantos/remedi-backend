import { AppError } from '@/shared/errors/AppError'

export class InvalidDateRangeError extends AppError {
  constructor(message: string = 'endDate cannot be before startDate') {
    super(message, 400)
  }
}
