import Fastify, { type FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'

import { registerZod } from './plugins/registerZod'
import { registerCors } from './plugins/registerCors'
import { registerSwagger } from './plugins/registerSwagger'
import { setupErrorHandler } from './errors/setupErrorHandler'
import { registerRoutes } from './routes/registerRoutes'

export async function createServer(): Promise<FastifyInstance> {
  const app = Fastify().withTypeProvider<ZodTypeProvider>()

  registerZod(app)
  await registerCors(app)
  await registerSwagger(app)
  setupErrorHandler(app)
  await registerRoutes(app)

  return app
}
