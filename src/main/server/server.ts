import { inject, injectable } from 'tsyringe'
import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from '@fastify/type-provider-zod'

import { reminderRoutes } from '@/infra/http/routes/ReminderRoutes'
import { medicationRoutes } from '@/infra/http/routes/MedicationRoutes'
import { categoryRoutes } from '@/infra/http/routes/CategoryRoutes'
import { doseRoutes } from '@/infra/http/routes/DoseRoutes'

import { AppError } from '@/shared/errors/AppError'
import { logger } from '@/shared/utils/logger'

@injectable()
export class Server {
  private readonly app: FastifyInstance

  constructor() {
    this.app = Fastify()
  }

  public async start(port: number): Promise<void> {
    try {
      // 1. Configurações Base
      this.setupBaseConfig()

      // 2. Plugins Assíncronos
      await this.setupPlugins()

      // 3. Rotas e Handlers
      this.setupErrorHandler()
      await this.setupRoutes()

      // 4. Inicialização
      const address = await this.app.listen({ port, host: '0.0.0.0' })
      logger.info(`🚀 Server listening at ${address}`)
      logger.info(`📖 Documentation available at ${address}/docs`)

      // Exportar Swagger YAML para outras squads (após o listen para garantir registro completo)
      try {
        const yaml = this.app.swagger({ yaml: true })
        const fs = await import('node:fs/promises')
        const path = await import('node:path')
        await fs.writeFile(path.resolve(process.cwd(), 'swagger.yaml'), yaml)
        logger.info('📝 Swagger YAML exported to root directory')
      } catch (swaggerError) {
        logger.error('⚠️ Failed to export Swagger YAML: %o', swaggerError)
      }


    } catch (err) {
      logger.error('❌ Error starting server: %o', err)
      process.exit(1)
    }
  }

  private setupBaseConfig(): void {
    this.app.setValidatorCompiler(validatorCompiler)
    this.app.setSerializerCompiler(serializerCompiler)
  }

  private async setupPlugins(): Promise<void> {
    await this.app.register(fastifyCors, { origin: true })

    await this.app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Reminder API',
          description: 'Medication and reminder organizer API',
          version: '1.0.0',
        },
        servers: [{ url: 'http://localhost:3333', description: 'Development' }],
      },
      transform: jsonSchemaTransform,
    })

    await this.app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: false },
    })
  }

  private setupErrorHandler(): void {
    this.app.setErrorHandler((error: any, request, reply) => {
      if (error instanceof AppError) {
        logger.warn('Handled application error: %s', error.message)
        return reply.status(error.statusCode).send({ message: error.message })
      }

      if (error.validation) {
        return reply.status(400).send({
          message: 'Validation error',
          errors: error.validation,
        })
      }

      logger.error('Unhandled error: %o', error)
      return reply.status(500).send({ message: 'Internal server error' })
    })
  }

  private async setupRoutes(): Promise<void> {
    await this.app.register(reminderRoutes, { prefix: '/reminders' })
    await this.app.register(medicationRoutes, { prefix: '/medications' })
    await this.app.register(categoryRoutes, { prefix: '/categories' })
    await this.app.register(doseRoutes, { prefix: '/medications' }) // Note: DoseRoutes handles /doses and /:id/doses
  }
}

