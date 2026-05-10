import { db } from './database'
import { categories, medications, reminders, medicationSchedules, doseEvents } from './schema/schema'
import { logger } from '@/shared/utils/logger'

async function seed() {
  logger.info('🌱 Seeding database...')

  try {
    // 1. Limpar tabelas existentes (opcional, mas recomendado para seeds)
    await db.delete(doseEvents)
    await db.delete(medicationSchedules)
    await db.delete(medications)
    await db.delete(reminders)
    await db.delete(categories)

    // 2. Inserir Categorias
    const categoryList = await db.insert(categories).values([
      { id: 'cat-1', name: 'Antibióticos', color: '#FF5733' },
      { id: 'cat-2', name: 'Suplementos', color: '#33FF57' },
      { id: 'cat-3', name: 'Uso Contínuo', color: '#3357FF' },
    ]).returning()

    logger.info(`✅ ${categoryList.length} categories inserted`)

    // 3. Inserir Medicamentos
    const medicationList = await db.insert(medications).values([
      {
        id: 'med-1',
        name: 'Amoxicilina',
        description: 'Tomar após as refeições',
        dosage: '500mg',
        frequency: 'DAILY',
        startDate: new Date(),
        nextDoseAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        categoryId: 'cat-1',
        active: true,
      },
      {
        id: 'med-2',
        name: 'Vitamina C',
        description: 'Efervescente',
        dosage: '1g',
        frequency: 'DAILY',
        startDate: new Date(),
        nextDoseAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        categoryId: 'cat-2',
        active: true,
      },
    ]).returning()

    logger.info(`✅ ${medicationList.length} medications inserted`)

    // 4. Inserir Lembretes
    const reminderList = await db.insert(reminders).values([
      {
        id: 'rem-1',
        title: 'Beber Água',
        description: 'Meta de 2L por dia',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        completed: false,
      },
      {
        id: 'rem-2',
        title: 'Ligar para o Médico',
        description: 'Marcar retorno',
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        completed: false,
      },
    ]).returning()

    logger.info(`✅ ${reminderList.length} reminders inserted`)

    // 5. Inserir Agendamentos (Schedules)
    await db.insert(medicationSchedules).values([
      {
        id: 'sched-1',
        medicationId: 'med-1',
        type: 'INTERVAL',
        intervalHours: 8,
        times: ['08:00', '16:00', '00:00'],
        startDate: new Date(),
      },
      {
        id: 'sched-2',
        medicationId: 'med-2',
        type: 'DAILY',
        times: ['09:00'],
        startDate: new Date(),
      },
    ])

    // 6. Inserir Eventos de Dose (Dose Events)
    await db.insert(doseEvents).values([
      {
        id: 'dose-1',
        medicationId: 'med-1',
        scheduledAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        takenAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        status: 'TAKEN',
      },
      {
        id: 'dose-2',
        medicationId: 'med-1',
        scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: 'PENDING',
      },
      {
        id: 'dose-3',
        medicationId: 'med-2',
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'MISSED',
      },
    ])

    logger.info('🚀 Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    logger.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
