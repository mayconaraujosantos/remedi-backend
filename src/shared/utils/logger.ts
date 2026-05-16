import { createLogger, format, transports } from 'winston'
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport'
import { config } from '@/main/config/config'

const isProduction = config.nodeEnv === 'production'

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  format.errors({ stack: true }),
  format.splat(),

  format.printf(({ timestamp, level, message, service, stack, ...meta }) => {
    const metadata =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : ''

    return stack
      ? `[${timestamp}] [${service}] ${level}: ${message}\n${stack}${metadata}`
      : `[${timestamp}] [${service}] ${level}: ${message}${metadata}`
  })
)

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
)

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',

  format: isProduction ? prodFormat : devFormat,

  defaultMeta: {
    service: 'reminder-api',
  },

  transports: [
    new transports.Console(),

    new OpenTelemetryTransportV3({
      level: isProduction ? 'info' : 'debug',
    }),
  ],
})

export { logger }
