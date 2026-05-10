import { inject, injectable } from 'tsyringe'
import { MedicationService } from '@/application/services/MedicationService'
import type { CreateMedicationDTO } from '@/application/dto/CreateMedicationDTO'
import type { UpdateMedicationDTO } from '@/application/dto/UpdateMedicationDTO'
import { DateUtils } from '@/shared/utils/date-utils'
import { MedicationPresenter } from '@/application/presenters/medication-presenter'

@injectable()
export class MedicationController {
  constructor(
    @inject(MedicationService)
    private readonly medicationService: MedicationService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any) {
    const convertedData: CreateMedicationDTO = {
      name: data.name,
      description: data.description,
      dosage: data.dosage,
      categoryId: data.categoryId,
      schedule: {
        type: data.schedule.type,
        times: data.schedule.times,
        intervalHours: data.schedule.intervalHours,
        daysOfWeek: data.schedule.daysOfWeek,
        startDate: DateUtils.parse(data.schedule.startDate, 'startDate'),
        endDate: data.schedule.endDate
          ? DateUtils.parse(data.schedule.endDate, 'endDate')
          : undefined,
      },
    }
    const medication = await this.medicationService.create(convertedData)
    return MedicationPresenter.toHTTP(medication)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(data: any) {
    const convertedData: UpdateMedicationDTO = {
      id: data.id,
      name: data.name,
      description: data.description,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: data.startDate
        ? DateUtils.parse(data.startDate, 'startDate')
        : undefined,
      endDate: data.endDate
        ? DateUtils.parse(data.endDate, 'endDate')
        : undefined,
      nextDoseAt: data.nextDoseAt
        ? DateUtils.parse(data.nextDoseAt, 'nextDoseAt')
        : undefined,
      categoryId: data.categoryId,
      active: data.active,
    }
    const medication = await this.medicationService.update(convertedData)
    return MedicationPresenter.toHTTP(medication)
  }

  async delete(id: string) {
    return this.medicationService.delete(id)
  }

  async list(filters?: Parameters<MedicationService['list']>[0]) {
    const medications = await this.medicationService.list(filters)
    return MedicationPresenter.toHTTPList(medications)
  }
}
