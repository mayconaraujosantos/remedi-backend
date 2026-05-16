import '@/infra/db/database'
import { pingDatabase } from '@/infra/db/pingDatabase'
import { logger } from '@/shared/utils/logger'

export async function registerPersistence(): Promise<void> {
  const ok = await pingDatabase()

  if (!ok) {
    logger.error('PostgreSQL is unreachable at startup')
    process.exit(1)
  }

  logger.info('PostgreSQL connected')
}
