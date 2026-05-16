import { injectable } from 'tsyringe'
import { eq, like, lt, gt, gte, lte, and } from 'drizzle-orm'
import { Medication } from '@/domain/entities/Medication'
import type {
  MedicationRepository,
  MedicationListFilters,
} from '@/domain/repositories/MedicationRepository'
import { db } from '@/infra/db/database'
import { medications } from '@/infra/db/schema/schema'
import { MedicationMapper } from '@/infra/db/mappers/medication-mapper'
import { withDbSpan } from '@/shared/utils/db-tracer'

@injectable()
export class MedicationRepositoryDrizzle implements MedicationRepository {
  async create(medication: Medication): Promise<void> {
    const data = MedicationMapper.toPersistence(medication)
    await withDbSpan(
      'medication',
      'create',
      { 'medication.id': medication.id, 'medication.name': medication.name },
      () => db.insert(medications).values(data)
    )
  }

  async findById(id: string): Promise<Medication | null> {
    const [data] = await withDbSpan(
      'medication',
      'findById',
      { 'medication.id': id },
      () => db.select().from(medications).where(eq(medications.id, id)).limit(1)
    )
    if (!data) return null
    return MedicationMapper.toDomain(data)
  }

  async update(medication: Medication): Promise<void> {
    const data = MedicationMapper.toPersistence(medication)
    await withDbSpan(
      'medication',
      'update',
      { 'medication.id': medication.id, 'medication.name': medication.name },
      () =>
        db
          .update(medications)
          .set(data)
          .where(eq(medications.id, medication.id))
    )
  }

  async delete(id: string): Promise<void> {
    await withDbSpan('medication', 'delete', { 'medication.id': id }, () =>
      db.delete(medications).where(eq(medications.id, id))
    )
  }

  async list(filters?: MedicationListFilters): Promise<Medication[]> {
    const attrs: Record<string, string> = {}
    if (filters?.status) attrs['filter.status'] = filters.status
    if (filters?.categoryId) attrs['filter.categoryId'] = filters.categoryId
    if (filters?.search) attrs['filter.search'] = filters.search

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = db.select().from(medications)

    if (filters?.status) {
      query = query.where(
        filters.status === 'active'
          ? eq(medications.active, true)
          : eq(medications.active, false)
      )
    }
    if (filters?.categoryId) {
      query = query.where(eq(medications.categoryId, filters.categoryId))
    }
    if (filters?.search) {
      query = query.where(like(medications.name, `%${filters.search}%`))
    }
    if (filters?.dueBefore) {
      query = query.where(lt(medications.nextDoseAt, filters.dueBefore))
    }
    if (filters?.dueAfter) {
      query = query.where(gt(medications.nextDoseAt, filters.dueAfter))
    }
    if (filters?.upcoming) {
      const now = new Date()
      const nextDay = new Date(now)
      nextDay.setDate(now.getDate() + 1)
      query = query.where(
        and(
          gte(medications.nextDoseAt, now),
          lte(medications.nextDoseAt, nextDay)
        )
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = await withDbSpan(
      'medication',
      'list',
      attrs,
      () => query
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((row: any) => MedicationMapper.toDomain(row))
  }
}
