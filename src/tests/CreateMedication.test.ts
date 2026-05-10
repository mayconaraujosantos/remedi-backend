import 'reflect-metadata'
import { describe, it, expect, beforeEach } from 'vitest'
import { CreateMedication } from '@/application/usecases/CreateMedication'
import { MedicationRepositoryDrizzle } from '@/infra/db/MedicationRepositoryDrizzle'

describe('CreateMedication', () => {
  let createMedication: CreateMedication
  let repository: MedicationRepositoryDrizzle

  beforeEach(() => {
    repository = new MedicationRepositoryDrizzle()
    createMedication = new CreateMedication(repository)
  })

  it('should create a medication schedule', async () => {
    const data = {
      name: 'Vitamin D',
      description: 'Daily vitamin supplement',
      dosage: '1000 IU',
      frequency: 'daily' as const,
      startDate: new Date('2026-05-10T08:00:00Z'),
    }

    const medication = await createMedication.execute(data)

    expect(medication.name).toBe('Vitamin D')
    expect(medication.dosage).toBe('1000 IU')
    expect(medication.frequency).toBe('daily')
    expect(medication.nextDoseAt).toEqual(new Date('2026-05-10T08:00:00Z'))
    expect(medication.active).toBe(true)
  })
})
