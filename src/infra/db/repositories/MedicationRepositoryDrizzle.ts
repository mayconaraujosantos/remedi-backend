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

@injectable()
export class MedicationRepositoryDrizzle implements MedicationRepository {
  async create(medication: Medication): Promise<void> {
    await db.insert(medications).values({
      id: medication.id,
      name: medication.name,
      description: medication.description ?? null,
      dosage: medication.dosage.value,
      frequency: medication.frequency,
      startDate: medication.timeRange.startDate,
      endDate: medication.timeRange.endDate ?? null,
      nextDoseAt: medication.nextDoseAt,
      categoryId: medication.categoryId ?? null,
      active: medication.active,
      createdAt: medication.createdAt,
    })
  }

  async findById(id: string): Promise<Medication | null> {
    const [data] = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id))
      .limit(1)
    if (!data) return null
    return MedicationMapper.toDomain(data)
  }

  async update(medication: Medication): Promise<void> {
    await db
      .update(medications)
      .set({
        name: medication.name,
        description: medication.description ?? null,
        dosage: medication.dosage.value,
        frequency: medication.frequency,
        startDate: medication.timeRange.startDate,
        endDate: medication.timeRange.endDate ?? null,
        nextDoseAt: medication.nextDoseAt,
        categoryId: medication.categoryId ?? null,
        active: medication.active,
      })
      .where(eq(medications.id, medication.id))
  }

  async delete(id: string): Promise<void> {
    await db.delete(medications).where(eq(medications.id, id))
  }

  async list(filters?: MedicationListFilters): Promise<Medication[]> {
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

    const rows = await query

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((row: any) => MedicationMapper.toDomain(row))
  }
}
