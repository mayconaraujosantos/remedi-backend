import { SpanStatusCode, trace } from '@opentelemetry/api'
import type { FastifyError, FastifyInstance } from 'fastify'

import { AppError } from '@/shared/errors/AppError'
import { logger } from '@/shared/utils/logger'
import { trackHttpServerError } from '@/shared/utils/metrics'

export function setupErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
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

    // Fastify 4xx errors (invalid JSON, unsupported media type, etc.)
    // are client errors — log as warn and return the original status code
    if (error.statusCode && error.statusCode < 500) {
      logger.warn(
        'Client error [%s]: %s',
        error.code ?? error.statusCode,
        error.message
      )
      return reply.status(error.statusCode).send({ message: error.message })
    }

    const activeSpan = trace.getActiveSpan()
    activeSpan?.recordException(error)
    activeSpan?.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    })

    trackHttpServerError({
      method: request.method,
      route: request.routeOptions.url ?? request.url,
      statusCode: error.statusCode ?? 500,
      errorType: error.name ?? 'Error',
    })

    logger.error('Unhandled error: %o', error)
    return reply
      .status(error.statusCode ?? 500)
      .send({ message: 'Internal server error' })
  })
}
