import { container } from 'tsyringe'

import { CategoryRepositoryDrizzle } from '@/infra/db/repositories/CategoryRepositoryDrizzle'
import { CreateReminder } from '@/application/usecases/CreateReminder'
import { UpdateReminder } from '@/application/usecases/UpdateReminder'
import { DeleteReminder } from '@/application/usecases/DeleteReminder'
import { ListReminders } from '@/application/usecases/ListReminders'
import { CreateMedication } from '@/application/usecases/CreateMedication'
import { UpdateMedication } from '@/application/usecases/UpdateMedication'
import { DeleteMedication } from '@/application/usecases/DeleteMedication'
import { ListMedications } from '@/application/usecases/ListMedications'
import { CreateCategory } from '@/application/usecases/CreateCategory'
import { UpdateCategory } from '@/application/usecases/UpdateCategory'
import { DeleteCategory } from '@/application/usecases/DeleteCategory'
import { ListCategories } from '@/application/usecases/ListCategories'
import { ReminderService } from '@/application/services/ReminderService'
import { MedicationService } from '@/application/services/MedicationService'
import { CategoryService } from '@/application/services/CategoryService'
import { ReminderController } from '@/infra/http/controllers/ReminderController'
import { MedicationController } from '@/infra/http/controllers/MedicationController'
import { CategoryController } from '@/infra/http/controllers/CategoryController'
import { Server } from '@/main/server/server'
import { ReminderRepositoryDrizzle } from '@/infra/db/repositories/ReminderRepositoryDrizzle'
import { MedicationRepositoryDrizzle } from '@/infra/db/repositories/MedicationRepositoryDrizzle'
import { MedicationScheduleRepositoryDrizzle } from '@/infra/db/repositories/MedicationScheduleRepositoryDrizzle'
import { DoseEventRepositoryDrizzle } from '@/infra/db/repositories/DoseEventRepositoryDrizzle'
import { BullMQQueueProvider } from '@/infra/queue/BullMQQueueProvider'

import { MarkDoseAsTaken } from '@/application/usecases/MarkDoseAsTaken'
import { MarkDoseAsSkipped } from '@/application/usecases/MarkDoseAsSkipped'
import { ListMedicationDoses } from '@/application/usecases/ListMedicationDoses'
import { GenerateDoseEvents } from '@/application/usecases/GenerateDoseEvents'
import { MarkDoseAsMissed } from '@/application/usecases/MarkDoseAsMissed'
import { DoseService } from '@/application/services/DoseService'
import { DoseController } from '@/infra/http/controllers/DoseController'
import { HealthController } from '@/infra/http/controllers/HealthController'

container.registerSingleton('ReminderRepository', ReminderRepositoryDrizzle)
container.registerSingleton('MedicationRepository', MedicationRepositoryDrizzle)
container.registerSingleton('CategoryRepository', CategoryRepositoryDrizzle)
container.registerSingleton(
  'MedicationScheduleRepository',
  MedicationScheduleRepositoryDrizzle
)
container.registerSingleton('DoseEventRepository', DoseEventRepositoryDrizzle)
container.registerSingleton('QueueProvider', BullMQQueueProvider)

container.registerSingleton(CreateReminder)
container.registerSingleton(UpdateReminder)
container.registerSingleton(DeleteReminder)
container.registerSingleton(ListReminders)
container.registerSingleton(CreateMedication)
container.registerSingleton(UpdateMedication)
container.registerSingleton(DeleteMedication)
container.registerSingleton(ListMedications)
container.registerSingleton(CreateCategory)
container.registerSingleton(UpdateCategory)
container.registerSingleton(DeleteCategory)
container.registerSingleton(ListCategories)
container.registerSingleton(MarkDoseAsTaken)
container.registerSingleton(MarkDoseAsSkipped)
container.registerSingleton(ListMedicationDoses)
container.registerSingleton(GenerateDoseEvents)
container.registerSingleton(MarkDoseAsMissed)

container.registerSingleton(ReminderService)
container.registerSingleton(MedicationService)
container.registerSingleton(CategoryService)
container.registerSingleton(DoseService)

container.registerSingleton(ReminderController)
container.registerSingleton(MedicationController)
container.registerSingleton(CategoryController)
container.registerSingleton(DoseController)
container.registerSingleton(HealthController)
container.registerSingleton(Server)
