import type { MedicationResponseDTO } from '@/application/dto/MedicationResponseDTO'

export class MedicationPresenter {
  static toHTTP(dto: MedicationResponseDTO) {
    return {
      ...dto,
      links: {
        self: `/medications/${dto.id}`,
      },
    }
  }

  static toHTTPList(dtos: MedicationResponseDTO[]) {
    return {
      items: dtos.map(this.toHTTP),
      total: dtos.length,
    }
  }
}
