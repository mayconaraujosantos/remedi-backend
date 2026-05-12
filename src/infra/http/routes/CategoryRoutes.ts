import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { CategoryController } from '../controllers/CategoryController'
import { createCategorySchema } from '../validators/CreateCategoryValidator'

export async function categoryRoutes(app: FastifyInstance) {
  const controller = container.resolve(CategoryController)

  app.post(
    '/',
    {
      schema: {
        tags: ['Categories'],
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
      schema: { tags: ['Categories'] },
    },
    async (_request, reply) => {
      const categories = await controller.list()
      return reply.send(categories)
    }
  )
}
