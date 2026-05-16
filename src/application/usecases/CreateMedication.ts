import { inject, injectable } from 'tsyringe'
import { Medication } from '@/domain/entities/Medication'
import { MedicationSchedule } from '@/domain/entities/MedicationSchedule'
import type { MedicationRepository } from '@/domain/repositories/MedicationRepository'
import type { MedicationScheduleRepository } from '@/domain/repositories/MedicationScheduleRepository'
import { GenerateDoseEvents } from './GenerateDoseEvents'
import type { CreateMedicationDTO } from '@/application/dto/CreateMedicationDTO'
import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'
import { MedicationMapper } from '@/application/mappers/medication-mapper'

@injectable()
export class CreateMedication {
  constructor(
    @inject('MedicationRepository')
    private readonly medicationRepository: MedicationRepository,
    @inject('MedicationScheduleRepository')
    private readonly scheduleRepository: MedicationScheduleRepository,
    @inject(GenerateDoseEvents)
    private readonly generateDoseEvents: GenerateDoseEvents
  ) {}

  async execute(data: CreateMedicationDTO): Promise<MedicationResponseDTO> {
    const medication = Medication.create(
      data.name,
      data.dosage,
      data.description,
      data.categoryId
    )

    await this.medicationRepository.create(medication)

    const schedule = new MedicationSchedule({
      medicationId: medication.id,
      type: data.schedule.type,
      intervalHours: data.schedule.intervalHours,
      daysOfWeek: data.schedule.daysOfWeek,
      times: data.schedule.times,
      startDate: data.schedule.startDate,
      endDate: data.schedule.endDate,
    })

    await this.scheduleRepository.create(schedule)

    // Gerar doses iniciais
    await this.generateDoseEvents.execute(schedule)

    return MedicationMapper.toDTO(medication, schedule)
  }
}
