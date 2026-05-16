import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { z } from 'zod'
import { MedicationController } from '../controllers/MedicationController'
import { createMedicationSchema } from '../validators/CreateMedicationValidator'
import { updateMedicationSchema } from '../validators/UpdateMedicationValidator'

const routeParamsSchema = z.object({
  id: z.string(),
})

export async function medicationRoutes(app: FastifyInstance) {
  const controller = container.resolve(MedicationController)

  app.post(
    '/',
    {
      schema: {
        tags: ['Medications'],
        summary: 'Create medication',
        body: createMedicationSchema,
      },
    },
    async (request, reply) => {
      const data = createMedicationSchema.parse(request.body)
      const medication = await controller.create(data)
      return reply.status(201).send(medication)
    }
  )

  app.get(
    '/',
    {
      schema: {
        tags: ['Medications'],
        summary: 'List medications',
      },
    },
    async (request, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters = request.query as any
      const medications = await controller.list(filters)
      return reply.send(medications)
    }
  )

  app.put(
    '/:id',
    {
      schema: {
        tags: ['Medications'],
        summary: 'Update medication',
        params: routeParamsSchema,
        body: updateMedicationSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }

      const data = updateMedicationSchema.parse({
        ...(request.body as Record<string, unknown>),
        id,
      })
      const medication = await controller.update(data)
      return reply.send(medication)
    }
  )

  app.delete(
    '/:id',
    {
      schema: {
        tags: ['Medications'],
        summary: 'Delete medication',
        params: routeParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      await controller.delete(id)
      return reply.status(204).send()
    }
  )
}
