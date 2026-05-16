import { type FastifyInstance } from 'fastify'

import { closeRedis } from '@/infra/cache/redis'
import { worker } from '@/infra/queue/worker'
import { logger } from '@/shared/utils/logger'

export function setupGracefulShutdown(app: FastifyInstance): void {
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`)

    try {
      await app.close()
      await worker.close()
      await closeRedis()
    } catch (err) {
      logger.error('Error during graceful shutdown: %o', err)
    }

    process.exit(0)
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}
