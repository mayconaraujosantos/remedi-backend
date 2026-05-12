import { Worker, Job } from 'bullmq'
import { container } from 'tsyringe'
import { connection } from './connection'
import { JobData } from '@/application/providers/QueueProvider'
import { logger } from '@/shared/utils/logger'
import { MarkDoseAsMissed } from '@/application/usecases/MarkDoseAsMissed'
import {
  remindersSentTotal,
  notificationFailuresTotal,
  notificationLatency,
} from '@/shared/utils/metrics'

export const worker = new Worker(
  'dose-reminders',
  async (job: Job<JobData>) => {
    const startTime = Date.now()
    const { doseId, medicationName } = job.data

    try {
      if (job.name === 'dose-reminder') {
        logger.info(
          `[WORKER] Sending reminder for ${medicationName} (Dose ID: ${doseId})`
        )
        console.log(
          `\n🔔 REMINDER: Time to take your medication: ${medicationName}!`
        )
        remindersSentTotal.add(1)
      }

      if (job.name === 'check-missed-dose') {
        logger.info(
          `[WORKER] Checking if dose ${doseId} for ${medicationName} was missed`
        )
        const markMissed = container.resolve(MarkDoseAsMissed)
        await markMissed.execute(doseId)
      }

      const duration = Date.now() - startTime
      notificationLatency.record(duration)
    } catch (error) {
      notificationFailuresTotal.add(1)
      throw error
    }
  },
  { connection }
)

worker.on('completed', (job) => {
  logger.info(`[WORKER] Job ${job.id} completed!`)
})

worker.on('failed', (job, err) => {
  logger.error(`[WORKER] Job ${job?.id} failed with ${err.message}`)
})
