export interface JobData {
  doseId: string
  medicationName: string
  scheduledAt: Date
}

export interface QueueProvider {
  addJob(name: string, data: JobData, delay?: number): Promise<void>
}
