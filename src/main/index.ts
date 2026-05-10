import 'reflect-metadata'
import '@/shared/utils/tracing'
import { container } from 'tsyringe'
import '@/main/container/container'
import { Server } from '@/main/server/server'
import { config } from '@/main/config/config'
import '@/infra/queue/worker'

const server = container.resolve(Server)
server.start(Number(config.port)).then((r) => r)
