import { worker } from '@/infra/queue/worker'
import { logger } from '@/shared/utils/logger'

export function registerMessaging(): void {
  // Worker is created on module import; keep reference for graceful shutdown
  worker.on('ready', () => {
    logger.info('BullMQ worker ready (queue: dose-reminders)')
  })
}
