import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { z } from 'zod'
import { DoseController } from '../controllers/DoseController'

const routeParamsSchema = z.object({
  id: z.string(),
})

export async function doseRoutes(app: FastifyInstance) {
  const controller = container.resolve(DoseController)

  app.patch(
    '/doses/:id/take',
    {
      schema: {
        tags: ['Adherence'],
        params: routeParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const result = await controller.markAsTaken(id)
      return reply.send(result)
    }
  )

  app.patch(
    '/doses/:id/skip',
    {
      schema: {
        tags: ['Adherence'],
        params: routeParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const result = await controller.markAsSkipped(id)
      return reply.send(result)
    }
  )

  app.get(
    '/:id/doses',
    {
      schema: {
        tags: ['Adherence'],
        params: routeParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const doses = await controller.listByMedication(id, request.query)
      return reply.send(doses)
    }
  )

  app.post(
    '/:id/doses/ad-hoc',
    {
      schema: {
        tags: ['Adherence'],
        summary: 'Register an ad-hoc (extra) dose',
        params: routeParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const result = await controller.registerAdHoc(id)
      return reply.status(201).send(result)
    }
  )
}
