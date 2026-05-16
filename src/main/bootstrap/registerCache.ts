import { connectRedis } from '@/infra/cache/redis'

export async function registerCache(): Promise<void> {
  await connectRedis()
}
