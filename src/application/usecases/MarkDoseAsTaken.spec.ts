import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MarkDoseAsTaken } from './MarkDoseAsTaken'
import { DoseEvent } from '@/domain/entities/DoseEvent'
import { AppError } from '@/shared/errors/AppError'
import * as metrics from '@/shared/utils/metrics'

describe('MarkDoseAsTaken', () => {
  let sut: MarkDoseAsTaken
  let doseEventRepository: any

  beforeEach(() => {
    doseEventRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    }
    sut = new MarkDoseAsTaken(doseEventRepository)

    // Spy on metrics
    vi.spyOn(metrics, 'trackDoseTaken').mockImplementation(() => {})
  })

  it('should mark a pending dose as taken', async () => {
    // 1. Fake Object
    const dose = new DoseEvent({
      id: 'dose-1',
      medicationId: 'med-1',
      scheduledAt: new Date(),
      status: 'PENDING',
    })

    // 2. Stubbing behavior
    doseEventRepository.findById.mockResolvedValue(dose)

    await sut.execute('dose-1')

    // 3. Mocks (Verificando interações)
    expect(dose.status).toBe('TAKEN')
    expect(dose.takenAt).toBeDefined()
    expect(doseEventRepository.update).toHaveBeenCalledWith(dose)
    expect(metrics.trackDoseTaken).toHaveBeenCalled()
  })

  it('should throw error if dose is not found', async () => {
    doseEventRepository.findById.mockResolvedValue(null)

    await expect(sut.execute('invalid-id')).rejects.toThrow(AppError)
    await expect(sut.execute('invalid-id')).rejects.toThrow(
      'Dose event not found'
    )
  })

  it('should throw error if dose is already taken', async () => {
    const dose = new DoseEvent({
      id: 'dose-1',
      medicationId: 'med-1',
      scheduledAt: new Date(),
      status: 'TAKEN',
    })
    doseEventRepository.findById.mockResolvedValue(dose)

    await expect(sut.execute('dose-1')).rejects.toThrow(AppError)
    expect(doseEventRepository.update).not.toHaveBeenCalled()
  })
})
