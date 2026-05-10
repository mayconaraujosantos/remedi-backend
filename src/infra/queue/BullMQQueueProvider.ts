import { injectable } from 'tsyringe'
import { Queue } from 'bullmq'
import { connection } from './connection'
import { QueueProvider, JobData } from '@/application/providers/QueueProvider'

@injectable()
export class BullMQQueueProvider implements QueueProvider {
  private readonly queue: Queue

  constructor() {
    this.queue = new Queue('dose-reminders', { connection })
  }

  async addJob(name: string, data: JobData, delay?: number): Promise<void> {
    await this.queue.add(name, data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    })
  }
}
