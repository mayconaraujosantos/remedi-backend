import { inject, injectable } from 'tsyringe'
import { MedicationSchedule } from '@/domain/entities/MedicationSchedule'
import { DoseEvent } from '@/domain/entities/DoseEvent'
import type { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import type { MedicationRepository } from '@/domain/repositories/MedicationRepository'
import type { QueueProvider } from '@/application/providers/QueueProvider'

@injectable()
export class GenerateDoseEvents {
  constructor(
    @inject('DoseEventRepository')
    private readonly doseEventRepository: DoseEventRepository,
    @inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @inject('QueueProvider')
    private readonly queueProvider: QueueProvider
  ) {}

  async execute(
    schedule: MedicationSchedule,
    daysToGenerate: number = 7
  ): Promise<void> {
    const medication = await this.medicationRepository.findById(
      schedule.medicationId
    )
    if (!medication) return

    const doses: DoseEvent[] = []
    const start = new Date(schedule.startDate)
    const endWindow = new Date()
    endWindow.setDate(endWindow.getDate() + daysToGenerate)

    // Se o agendamento tiver uma data de término, respeitá-la
    const maxDate =
      schedule.endDate && schedule.endDate < endWindow
        ? schedule.endDate
        : endWindow

    switch (schedule.type) {
      case 'ONCE':
        this.generateOnceDoses(schedule, doses)
        break
      case 'DAILY':
        this.generateDailyDoses(schedule, start, maxDate, doses)
        break
      case 'WEEKLY':
        this.generateWeeklyDoses(schedule, start, maxDate, doses)
        break
      case 'INTERVAL':
        this.generateIntervalDoses(schedule, start, maxDate, doses)
        break
    }

    for (const dose of doses) {
      await this.doseEventRepository.create(dose)

      // Agendar notificação
      const now = new Date()
      const delay = dose.scheduledAt.getTime() - now.getTime()

      if (delay > 0) {
        // Job para lembrar
        await this.queueProvider.addJob(
          'dose-reminder',
          {
            doseId: dose.id,
            medicationName: medication.name,
            scheduledAt: dose.scheduledAt,
          },
          delay
        )

        // Job para verificar se foi perdida (2 horas depois)
        const missedDelay = delay + 2 * 60 * 60 * 1000
        await this.queueProvider.addJob(
          'check-missed-dose',
          {
            doseId: dose.id,
            medicationName: medication.name,
            scheduledAt: dose.scheduledAt,
          },
          missedDelay
        )
      }
    }
  }

  private generateOnceDoses(schedule: MedicationSchedule, doses: DoseEvent[]) {
    for (const time of schedule.times) {
      const scheduledAt = this.combineDateAndTime(schedule.startDate, time)
      doses.push(
        new DoseEvent({
          medicationId: schedule.medicationId,
          scheduledAt,
        })
      )
    }
  }

  private generateDailyDoses(
    schedule: MedicationSchedule,
    start: Date,
    end: Date,
    doses: DoseEvent[]
  ) {
    const current = new Date(start)
    while (current <= end) {
      for (const time of schedule.times) {
        const scheduledAt = this.combineDateAndTime(current, time)
        if (scheduledAt >= start && scheduledAt <= end) {
          doses.push(
            new DoseEvent({
              medicationId: schedule.medicationId,
              scheduledAt,
            })
          )
        }
      }
      current.setDate(current.getDate() + 1)
    }
  }

  private generateWeeklyDoses(
    schedule: MedicationSchedule,
    start: Date,
    end: Date,
    doses: DoseEvent[]
  ) {
    const current = new Date(start)
    const daysOfWeek = schedule.daysOfWeek || []

    while (current <= end) {
      if (daysOfWeek.includes(current.getDay())) {
        for (const time of schedule.times) {
          const scheduledAt = this.combineDateAndTime(current, time)
          if (scheduledAt >= start && scheduledAt <= end) {
            doses.push(
              new DoseEvent({
                medicationId: schedule.medicationId,
                scheduledAt,
              })
            )
          }
        }
      }
      current.setDate(current.getDate() + 1)
    }
  }

  private generateIntervalDoses(
    schedule: MedicationSchedule,
    start: Date,
    end: Date,
    doses: DoseEvent[]
  ) {
    const interval = schedule.intervalHours || 24
    let current = new Date(start)

    while (current <= end) {
      doses.push(
        new DoseEvent({
          medicationId: schedule.medicationId,
          scheduledAt: new Date(current),
        })
      )
      current = new Date(current.getTime() + interval * 60 * 60 * 1000)
    }
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const newDate = new Date(date)
    if (hours !== undefined && minutes !== undefined) {
      newDate.setUTCHours(hours, minutes, 0, 0)
    }
    return newDate
  }
}
