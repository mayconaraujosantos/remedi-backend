import { injectable } from 'tsyringe'

import { createServer } from '@/infra/http/server/createServer'
import { exportSwaggerYaml } from '@/infra/http/server/docs/exportSwaggerYaml'
import { setupGracefulShutdown } from '@/infra/http/server/lifecycle/setupGracefulShutdown'
import { logger } from '@/shared/utils/logger'

@injectable()
export class Server {
  public async start(port: number): Promise<void> {
    try {
      const app = await createServer()
      setupGracefulShutdown(app)

      await app.ready()
      const address = await app.listen({ port, host: '0.0.0.0' })
      logger.info(`🚀 Server listening at ${address}`)
      logger.info(`📖 Documentation available at ${address}/docs`)

      await exportSwaggerYaml(app)
    } catch (err) {
      logger.error('❌ Error starting server: %o', err)
      process.exit(1)
    }
  }
}
