import { createLogger, format, transports } from 'winston'
import { config } from '@/main/config/config'

const isProduction = config.nodeEnv === 'production'

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    isProduction
      ? format.json()
      : format.combine(format.colorize(), format.prettyPrint())
  ),
  transports: [new transports.Console()],
  defaultMeta: { service: 'reminder-api' },
})

export { logger }
