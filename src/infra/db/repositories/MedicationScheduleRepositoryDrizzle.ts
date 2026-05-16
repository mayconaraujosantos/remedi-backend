import { injectable } from 'tsyringe'
import { eq } from 'drizzle-orm'
import { db } from '../database'
import { medicationSchedules } from '../schema/schema'
import { MedicationSchedule } from '@/domain/entities/MedicationSchedule'
import { MedicationScheduleRepository } from '@/domain/repositories/MedicationScheduleRepository'
import { MedicationScheduleMapper } from '../mappers/medication-schedule-mapper'
import { withDbSpan } from '@/shared/utils/db-tracer'

@injectable()
export class MedicationScheduleRepositoryDrizzle implements MedicationScheduleRepository {
  async create(schedule: MedicationSchedule): Promise<void> {
    const data = MedicationScheduleMapper.toPersistence(schedule)
    await withDbSpan(
      'medicationSchedule',
      'create',
      {
        'medication_schedule.id': schedule.id,
        'medication.id': schedule.medicationId,
      },
      () => db.insert(medicationSchedules).values(data)
    )
  }

  async update(schedule: MedicationSchedule): Promise<void> {
    const data = MedicationScheduleMapper.toPersistence(schedule)
    await withDbSpan(
      'medicationSchedule',
      'update',
      { 'medication_schedule.id': schedule.id },
      () =>
        db
          .update(medicationSchedules)
          .set(data)
          .where(eq(medicationSchedules.id, schedule.id))
    )
  }

  async delete(id: string): Promise<void> {
    await withDbSpan(
      'medicationSchedule',
      'delete',
      { 'medication_schedule.id': id },
      () => db.delete(medicationSchedules).where(eq(medicationSchedules.id, id))
    )
  }

  async findById(id: string): Promise<MedicationSchedule | null> {
    const [data] = await withDbSpan(
      'medicationSchedule',
      'findById',
      { 'medication_schedule.id': id },
      () =>
        db
          .select()
          .from(medicationSchedules)
          .where(eq(medicationSchedules.id, id))
          .limit(1)
    )
    return data ? MedicationScheduleMapper.toDomain(data) : null
  }

  async findByMedicationId(
    medicationId: string
  ): Promise<MedicationSchedule | null> {
    const [data] = await withDbSpan(
      'medicationSchedule',
      'findByMedicationId',
      { 'medication.id': medicationId },
      () =>
        db
          .select()
          .from(medicationSchedules)
          .where(eq(medicationSchedules.medicationId, medicationId))
          .limit(1)
    )
    return data ? MedicationScheduleMapper.toDomain(data) : null
  }
}
