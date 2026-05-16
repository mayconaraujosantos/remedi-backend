import Redis, { type RedisOptions } from 'ioredis'

import { config } from '@/main/config/config'
import { logger } from '@/shared/utils/logger'

function buildRedisOptions(): RedisOptions {
  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null, // required by BullMQ
    lazyConnect: true,
  }
}

export const redis = config.redis.url
  ? new Redis(config.redis.url, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    })
  : new Redis(buildRedisOptions())

/** Shared ioredis instance for BullMQ queues and workers */
export const connection = redis

redis.on('connect', () => {
  if (config.redis.url) {
    logger.info('Redis connected')
    return
  }

  logger.info('Redis connected (%s:%s)', config.redis.host, config.redis.port)
})

redis.on('error', (err) => {
  logger.error('Redis connection error: %o', err)
})

export async function connectRedis(): Promise<void> {
  if (redis.status === 'ready' || redis.status === 'connecting') {
    return
  }

  await redis.connect()
}

export async function pingRedis(): Promise<boolean> {
  try {
    const result = await redis.ping()
    return result === 'PONG'
  } catch {
    return false
  }
}

export async function closeRedis(): Promise<void> {
  if (redis.status === 'end') {
    return
  }

  await redis.quit()
  logger.info('Redis connection closed')
}
