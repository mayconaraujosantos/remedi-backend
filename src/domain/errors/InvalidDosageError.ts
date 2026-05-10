import { AppError } from '@/shared/errors/AppError'

export class InvalidDosageError extends AppError {
  constructor(message: string = 'Invalid dosage format or value') {
    super(message, 400)
  }
}
