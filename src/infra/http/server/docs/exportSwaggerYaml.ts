import { type FastifyInstance } from 'fastify'
import { logger } from '@/shared/utils/logger'

export async function exportSwaggerYaml(app: FastifyInstance): Promise<void> {
  try {
    const yaml = app.swagger({ yaml: true })
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    await fs.writeFile(path.resolve(process.cwd(), 'swagger.yaml'), yaml)
    logger.info('📝 Swagger YAML exported to root directory')
  } catch (swaggerError) {
    logger.error('⚠️ Failed to export Swagger YAML: %o', swaggerError)
  }
}
