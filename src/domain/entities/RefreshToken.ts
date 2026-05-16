export interface RefreshTokenProps {
  id?: string
  userId: string
  token: string
  expiresAt: Date
  createdAt?: Date
}

export class RefreshToken {
  public readonly id: string
  public readonly userId: string
  public readonly token: string
  public readonly expiresAt: Date
  public readonly createdAt: Date

  constructor(props: RefreshTokenProps) {
    this.id = props.id ?? crypto.randomUUID()
    this.userId = props.userId
    this.token = props.token
    this.expiresAt = props.expiresAt
    this.createdAt = props.createdAt ?? new Date()
  }

  public isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt
  }
}
