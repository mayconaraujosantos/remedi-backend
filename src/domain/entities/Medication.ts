import { Dosage } from '../value-objects/Dosage'
import { TimeRange } from '../value-objects/TimeRange'

export type MedicationFrequency =
  | 'once'
  | 'daily'
  | 'twice_daily'
  | 'every_other_day'
  | 'weekly'
  | 'custom'

export interface MedicationProps {
  id?: string
  name: string
  description?: string | undefined
  dosage: Dosage
  categoryId?: string | undefined
  active?: boolean | undefined
  createdAt: Date
}

export class Medication {
  public readonly id: string
  public readonly name: string
  public readonly description?: string | undefined
  public readonly dosage: Dosage
  public active: boolean
  public readonly categoryId?: string | undefined
  public readonly createdAt: Date

  constructor(props: MedicationProps) {
    this.id =
      props.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.name = props.name
    this.description = props.description
    this.dosage = props.dosage
    this.active = props.active ?? true
    this.categoryId = props.categoryId
    this.createdAt = props.createdAt
  }

  public markInactive(): void {
    this.active = false
  }

  public static create(
    name: string,
    dosageValue: string,
    description?: string,
    categoryId?: string
  ): Medication {
    const dosage = new Dosage(dosageValue)

    return new Medication({
      name,
      dosage,
      description,
      categoryId,
      createdAt: new Date(),
      active: true,
    })
  }
}
