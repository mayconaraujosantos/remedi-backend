import { injectable } from 'tsyringe'
import { eq, and, gte, lte } from 'drizzle-orm'
import { db } from '../database'
import { doseEvents } from '../schema/schema'
import { DoseEvent } from '@/domain/entities/DoseEvent'
import { DoseEventRepository } from '@/domain/repositories/DoseEventRepository'
import { DoseEventMapper } from '../mappers/dose-event-mapper'

@injectable()
export class DoseEventRepositoryDrizzle implements DoseEventRepository {
  async create(event: DoseEvent): Promise<void> {
    const data = DoseEventMapper.toPersistence(event)
    await db.insert(doseEvents).values(data)
  }

  async update(event: DoseEvent): Promise<void> {
    const data = DoseEventMapper.toPersistence(event)
    await db.update(doseEvents)
      .set(data)
      .where(eq(doseEvents.id, event.id))
  }

  async findById(id: string): Promise<DoseEvent | null> {
    const [data] = await db.select()
      .from(doseEvents)
      .where(eq(doseEvents.id, id))
      .limit(1)

    return data ? DoseEventMapper.toDomain(data) : null
  }

  async findByMedicationId(medicationId: string, startDate?: Date, endDate?: Date): Promise<DoseEvent[]> {
    let query = db.select().from(doseEvents).where(eq(doseEvents.medicationId, medicationId))

    const conditions = [eq(doseEvents.medicationId, medicationId)]
    if (startDate) conditions.push(gte(doseEvents.scheduledAt, startDate))
    if (endDate) conditions.push(lte(doseEvents.scheduledAt, endDate))

    const results = await db.select()
      .from(doseEvents)
      .where(and(...conditions))

    return results.map(DoseEventMapper.toDomain)
  }

  async listPending(): Promise<DoseEvent[]> {
    const results = await db.select()
      .from(doseEvents)
      .where(eq(doseEvents.status, 'PENDING'))

    return results.map(DoseEventMapper.toDomain)
  }
}
