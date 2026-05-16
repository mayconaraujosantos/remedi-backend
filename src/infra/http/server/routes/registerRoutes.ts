import type { FastifyInstance } from 'fastify'

import { healthRoutes } from '@/infra/http/routes/HealthRoutes'
import { reminderRoutes } from '@/infra/http/routes/ReminderRoutes'
import { medicationRoutes } from '@/infra/http/routes/MedicationRoutes'
import { categoryRoutes } from '@/infra/http/routes/CategoryRoutes'
import { doseRoutes } from '@/infra/http/routes/DoseRoutes'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(healthRoutes)
  await app.register(reminderRoutes, { prefix: '/reminders' })
  await app.register(medicationRoutes, { prefix: '/medications' })
  await app.register(categoryRoutes, { prefix: '/categories' })
  await app.register(doseRoutes, { prefix: '/medications' }) // DoseRoutes handles /doses and /:id/doses
}
