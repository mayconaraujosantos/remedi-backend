import { injectable } from 'tsyringe'

import { pingDatabase } from '@/infra/db/pingDatabase'
import { pingRedis } from '@/infra/cache/redis'

export interface HealthCheckResult {
  status: 'ok' | 'degraded'
  checks: {
    db: 'ok' | 'error'
    redis: 'ok' | 'error'
  }
}

@injectable()
export class HealthController {
  async check(): Promise<{ statusCode: number; body: HealthCheckResult }> {
    const [dbOk, redisOk] = await Promise.all([pingDatabase(), pingRedis()])

    const checks = {
      db: dbOk ? ('ok' as const) : ('error' as const),
      redis: redisOk ? ('ok' as const) : ('error' as const),
    }

    const healthy = dbOk && redisOk

    return {
      statusCode: healthy ? 200 : 503,
      body: {
        status: healthy ? 'ok' : 'degraded',
        checks,
      },
    }
  }
}
