import { sql } from 'drizzle-orm'

import { db } from './database'

export async function pingDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`)
    return true
  } catch {
    return false
  }
}
