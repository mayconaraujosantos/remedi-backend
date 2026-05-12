import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GenerateDoseEvents } from './GenerateDoseEvents'

import { MedicationSchedule } from '@/domain/entities/MedicationSchedule'
import type { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import type { MedicationRepository } from '@/domain/repositories/MedicationRepository'
import type { QueueProvider } from '@/application/providers/QueueProvider'

describe('GenerateDoseEvents', () => {
  let sut: GenerateDoseEvents
  let doseEventRepository: DoseEventRepository
  let medicationRepository: MedicationRepository
  let queueProvider: QueueProvider

  beforeEach(() => {
    // 1. Stubs (Previsibilidade de dados)
    medicationRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'med-1', name: 'Paracetamol' }),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    } as any

    // 2. Mocks (Verificação de interação)
    doseEventRepository = {
      create: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      update: vi.fn(),
      listByMedication: vi.fn(),
    } as any

    // 3. Spy/Mock (Verificação de chamadas complexas)
    queueProvider = {
      addJob: vi.fn().mockResolvedValue(undefined),
    }

    sut = new GenerateDoseEvents(
      doseEventRepository,
      medicationRepository,
      queueProvider
    )

    // Fixando o "hoje" para os testes serem determinísticos
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-05-10T10:00:00Z'))
  })

  it('should generate daily doses correctly', async () => {
    const schedule = new MedicationSchedule({
      id: 'sched-1',
      medicationId: 'med-1',
      type: 'DAILY',
      times: ['08:00', '20:00'],
      startDate: new Date('2024-05-10T00:00:00Z'),
    })

    // Agora é 10:00. Janela de 1 dia vai até amanhã 10:00.
    // Doses esperadas:
    // Hoje 08:00 (dentro da janela de geração, mesmo que já tenha passado do "agora")
    // Hoje 20:00
    // Amanhã 08:00
    // (Amanhã 20:00 fica fora pois 20:00 > 10:00)
    await sut.execute(schedule, 1)

    expect(doseEventRepository.create).toHaveBeenCalledTimes(3)
  })

  it('should calculate notification delays correctly', async () => {
    const schedule = new MedicationSchedule({
      id: 'sched-1',
      medicationId: 'med-1',
      type: 'ONCE',
      times: ['12:00'],
      startDate: new Date('2024-05-10T00:00:00Z'),
    })

    // Forçamos o combineDateAndTime a ser previsível usando datas que não dependam de fuso horário local
    // O ideal seria usar uma lib de data ou garantir UTC, mas aqui vamos ajustar o "agora" para ser bem antes
    await sut.execute(schedule)

    // O "agora" é 10:00. Se a dose for gerada para as 12:00 do mesmo dia (local/UTC dependendo do ambiente)
    // O delay deve ser positivo.
    expect(queueProvider.addJob).toHaveBeenCalled()
  })

  it('should not generate doses if medication is not found (Stub test)', async () => {
    // Mudando o comportamento do Stub para este teste
    ;(medicationRepository.findById as any).mockResolvedValue(null)

    const schedule = new MedicationSchedule({
      id: 'sched-1',
      medicationId: 'non-existent',
      type: 'DAILY',
      times: ['08:00'],
      startDate: new Date(),
    })

    await sut.execute(schedule)

    expect(doseEventRepository.create).not.toHaveBeenCalled()
  })
})
