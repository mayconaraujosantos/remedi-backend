import type { ReminderResponseDTO } from '@/application/dto/ReminderResponseDTO'

export class ReminderPresenter {
  static toHTTP(dto: ReminderResponseDTO) {
    return dto
  }

  static toHTTPList(dtos: ReminderResponseDTO[]) {
    return dtos
  }
}
