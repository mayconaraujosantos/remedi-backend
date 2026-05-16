export interface UserProps {
  id?: string
  fullName: string
  email: string
  passwordHash: string
  phone?: string
  timezone?: string
  locale?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UpdateProfileDTO {
  fullName?: string
  phone?: string
  timezone?: string
  locale?: string
}

export class User {
  public readonly id: string
  public fullName: string
  public readonly email: string
  public readonly passwordHash: string
  public phone?: string
  public timezone: string
  public locale: string
  public readonly createdAt: Date
  public updatedAt: Date

  constructor(props: UserProps) {
    this.id = props.id ?? crypto.randomUUID()
    this.fullName = props.fullName
    this.email = props.email
    this.passwordHash = props.passwordHash
    this.phone = props.phone
    this.timezone = props.timezone ?? 'UTC'
    this.locale = props.locale ?? 'en'
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public updateProfile(dto: UpdateProfileDTO): void {
    if (dto.fullName !== undefined) {
      this.fullName = dto.fullName
    }
    if (dto.phone !== undefined) {
      this.phone = dto.phone
    }
    if (dto.timezone !== undefined) {
      this.timezone = dto.timezone
    }
    if (dto.locale !== undefined) {
      this.locale = dto.locale
    }
    this.updatedAt = new Date()
  }
}
