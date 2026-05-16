import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { z } from 'zod'

import { HealthController } from '../controllers/HealthController'

const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  checks: z.object({
    db: z.enum(['ok', 'error']),
    redis: z.enum(['ok', 'error']),
  }),
})

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(HealthController)

  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: healthResponseSchema,
          503: healthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const { statusCode, body } = await controller.check()
      return reply.status(statusCode).send(body)
    }
  )
}
