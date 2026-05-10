import dotenv from 'dotenv'

dotenv.config()

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3333,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  otel: {
    serviceName: process.env.OTEL_SERVICE_NAME || 'reminder-api',
    serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
    collectorUrl:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/',
    tracesUrl:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/'}v1/traces`,
    metricsUrl:
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
      `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/'}v1/metrics`,
  },
}
