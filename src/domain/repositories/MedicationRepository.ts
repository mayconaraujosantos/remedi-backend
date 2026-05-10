import { Medication } from '@/domain/entities/Medication'

export interface MedicationListFilters {
  status?: 'active' | 'inactive'
  categoryId?: string
  search?: string
  dueBefore?: Date
  dueAfter?: Date
  upcoming?: boolean
}

export interface MedicationRepository {
  create(medication: Medication): Promise<void>
  findById(id: string): Promise<Medication | null>
  update(medication: Medication): Promise<void>
  delete(id: string): Promise<void>
  list(filters?: MedicationListFilters): Promise<Medication[]>
}
