import { AppError } from '@/shared/errors/AppError'

export class DateUtils {
  /**
   * Converte diferentes formatos de data para Date object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parse(value: any, fieldName: string): Date {
    if (value === null || value === undefined) {
      throw new AppError(`${fieldName} is required`, 400)
    }

    // Se já for Date e for válido
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new AppError(`Invalid ${fieldName}: invalid Date object`, 400)
      }
      return value
    }

    // Se for string ISO ou timestamp string
    if (typeof value === 'string') {
      // Tentar converter string para Date
      let date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date
      }

      // Tentar converter timestamp string para número (em segundos)
      const timestamp = parseInt(value, 10)
      if (!isNaN(timestamp)) {
        date = new Date(timestamp * 1000)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }

    // Se for número (timestamp)
    if (typeof value === 'number') {
      // Verificar se é timestamp em segundos (valor típico ~1.7e9) ou milissegundos (~1.7e12)
      const timestampInMs = value < 10000000000 ? value * 1000 : value
      const date = new Date(timestampInMs)
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    throw new AppError(
      `Invalid ${fieldName} format. Expected Date, ISO string, or UNIX timestamp (seconds or milliseconds)`,
      400
    )
  }

  /**
   * Valida se uma data é posterior a outra
   */
  static isAfter(date: Date, referenceDate: Date): boolean {
    return date > referenceDate
  }

  /**
   * Valida se uma data é anterior a outra
   */
  static isBefore(date: Date, referenceDate: Date): boolean {
    return date < referenceDate
  }

  /**
   * Converte Date para timestamp UNIX em segundos
   */
  static toUnixTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000)
  }
}
