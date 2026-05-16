import { registerObservability } from './registerObservability'
import { registerPersistence } from './registerPersistence'
import { registerCache } from './registerCache'
import { registerMessaging } from './registerMessaging'

export async function bootstrap(): Promise<void> {
  registerObservability()
  await registerPersistence()
  await registerCache()
  registerMessaging()
}

export { registerObservability } from './registerObservability'
export { registerPersistence } from './registerPersistence'
export { registerCache } from './registerCache'
export { registerMessaging } from './registerMessaging'
