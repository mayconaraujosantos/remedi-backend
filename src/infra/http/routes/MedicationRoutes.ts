import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { MedicationController } from '../controllers/MedicationController'
import { createMedicationSchema } from '../validators/CreateMedicationValidator'

export async function medicationRoutes(app: FastifyInstance) {
  const controller = container.resolve(MedicationController)

  app.post(
    '/',
    {
      schema: {
        tags: ['Medications'],
        summary: 'Create medication',
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
      schema: { tags: ['Medications'] },
    },
    async (request, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filters = request.query as any
      const medications = await controller.list(filters)
      return reply.send(medications)
    }
  )
}
