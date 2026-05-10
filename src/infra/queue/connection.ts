import Redis from 'ioredis'
import { config } from '@/main/config/config'

export const connection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null, // Necessário para BullMQ
})
