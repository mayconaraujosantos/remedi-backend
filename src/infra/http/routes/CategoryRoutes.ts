import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { z } from 'zod'
import { CategoryController } from '../controllers/CategoryController'
import { createCategorySchema } from '../validators/CreateCategoryValidator'
import { updateCategorySchema } from '../validators/UpdateCategoryValidator'

const routeParamsSchema = z.object({
  id: z.string(),
})

export async function categoryRoutes(app: FastifyInstance) {
  const controller = container.resolve(CategoryController)

  app.post(
    '/',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Create category',
        body: createCategorySchema,
      },
    },
    async (request, reply) => {
      const data = createCategorySchema.parse(request.body)
      const category = await controller.create(data)
      return reply.status(201).send(category)
    }
  )

  app.get(
    '/',
    {
      schema: {
        tags: ['Categories'],
        summary: 'List categories',
      },
    },
    async (_request, reply) => {
      const categories = await controller.list()
      return reply.send(categories)
    }
  )

  app.put(
    '/:id',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Update category',
        params: routeParamsSchema,
        body: updateCategorySchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = updateCategorySchema.parse({ ...(request.body as any), id })
      const category = await controller.update(data)
      return reply.send(category)
    }
  )

  app.delete(
    '/:id',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Delete category',
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
