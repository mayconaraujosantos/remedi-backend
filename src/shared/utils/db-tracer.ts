import { trace, SpanStatusCode, type Attributes } from '@opentelemetry/api'

const tracer = trace.getTracer('reminder-api')

/**
 * Wraps a DB operation in an OTel span.
 * Span name follows the convention: "db.<entity>.<operation>"
 *
 * @example
 * return withDbSpan('doseEvent', 'findById', { 'dose_event.id': id }, () =>
 *   db.select().from(doseEvents).where(eq(doseEvents.id, id)).limit(1)
 * )
 */
export async function withDbSpan<T>(
  entity: string,
  operation: string,
  attributes: Attributes,
  fn: () => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(`db.${entity}.${operation}`, {
    attributes: {
      'db.system': 'postgresql',
      'db.operation': operation,
      ...attributes,
    },
  })

  try {
    const result = await fn()
    return result
  } catch (err) {
    span.recordException(err as Error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (err as Error).message,
    })
    throw err
  } finally {
    span.end()
  }
}
