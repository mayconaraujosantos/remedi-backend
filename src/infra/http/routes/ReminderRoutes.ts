import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { ReminderController } from '../controllers/ReminderController'
import { createReminderSchema } from '../validators/CreateReminderValidator'
import { updateReminderSchema } from '../validators/UpdateReminderValidator'

export async function reminderRoutes(app: FastifyInstance) {
  const controller = container.resolve(ReminderController)

  app.post(
    '/',
    {
      schema: {
        tags: ['Reminders'],
        summary: 'Create a reminder',
        body: {
          type: 'object',
          required: ['title', 'dueDate'],
          properties: {
            title: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    async (request, reply) => {
      const data = createReminderSchema.parse(request.body)
      const reminder = await controller.create({
        ...data,
        dueDate: new Date(data.dueDate),
      })
      return reply.status(201).send(reminder)
    }
  )

  app.get(
    '/',
    {
      schema: {
        tags: ['Reminders'],
        summary: 'List all reminders',
      },
    },
    async (_request, reply) => {
      const reminders = await controller.list()
      return reply.send(reminders)
    }
  )

  app.put(
    '/:id',
    {
      schema: {
        tags: ['Reminders'],
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const data = updateReminderSchema.parse(request.body)
      const updated = await controller.update(id, {
        ...data,
        id,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      })
      return reply.send(updated)
    }
  )
}