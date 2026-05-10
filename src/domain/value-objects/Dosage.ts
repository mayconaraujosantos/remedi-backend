import { InvalidDosageError } from '../errors/InvalidDosageError'

export class Dosage {
  public readonly value: string

  constructor(value: string) {
    const trimmed = value.trim()
    if (!trimmed || trimmed.length === 0) {
      throw new InvalidDosageError('Dosage cannot be empty')
    }
    this.value = trimmed
  }

  toString(): string {
    return this.value
  }
}
