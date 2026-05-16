import { Worker, Job } from 'bullmq'
import { inject, injectable } from 'tsyringe'
import type { GenerateDoseEvents } from '@/application/usecases/GenerateDoseEvents'
import type { MedicationScheduleRepository } from '@/domain/repositories/MedicationScheduleRepository'
import { connection } from '@/infra/cache/redis'
import { logger } from '@/shared/utils/logger'

interface GenerateDoseEventsJobData {
  scheduleId: string
  daysToGenerate?: number
}

@injectable()
export class GenerateDoseEventsWorker {
  constructor(
    @inject('GenerateDoseEvents')
    private readonly generateDoseEvents: GenerateDoseEvents,
    @inject('MedicationScheduleRepository')
    private readonly scheduleRepository: MedicationScheduleRepository
  ) {}

  public listen() {
    const worker = new Worker(
      'dose-generation-queue',
      async (job: Job<GenerateDoseEventsJobData>) => {
        const { scheduleId, daysToGenerate } = job.data

        logger.info(`Processing job ${job.id} for schedule ${scheduleId}`)

        const schedule = await this.scheduleRepository.findById(scheduleId)

        if (!schedule) {
          logger.error(`Schedule ${scheduleId} not found for job ${job.id}`)
          throw new Error('Schedule not found')
        }

        await this.generateDoseEvents.execute(schedule, daysToGenerate)
      },
      {
        connection,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      }
    )

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} (GenerateDoseEvents) has completed`)
    })

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed: ${err.message}`)
    })

    logger.info('GenerateDoseEventsWorker is now listening for jobs...')
  }
}
