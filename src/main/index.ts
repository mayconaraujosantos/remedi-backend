import 'reflect-metadata'
import { container } from 'tsyringe'

import '@/main/container/container'
import { bootstrap } from '@/main/bootstrap'
import { Server } from '@/main/server/server'
import { config } from '@/main/config/config'

await bootstrap()

const server = container.resolve(Server)
await server.start(Number(config.port))
