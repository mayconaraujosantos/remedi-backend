import type { CategoryResponseDTO } from '@/application/dto/CategoryResponseDTO'

export class CategoryPresenter {
  static toHTTP(dto: CategoryResponseDTO) {
    return dto
  }

  static toHTTPList(dtos: CategoryResponseDTO[]) {
    return dtos
  }
}
