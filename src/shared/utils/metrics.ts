import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('reminder-api')

// Counters
export const remindersSentTotal = meter.createCounter('reminders_sent_total', {
  description: 'Total number of medication reminders sent',
})

export const dosesTakenTotal = meter.createCounter('doses_taken_total', {
  description: 'Total number of doses marked as taken',
})

export const dosesMissedTotal = meter.createCounter('doses_missed_total', {
  description: 'Total number of doses marked as missed',
})

export const notificationFailuresTotal = meter.createCounter('notification_failures_total', {
  description: 'Total number of notification delivery failures',
})

// Gauge for Adherence Rate
export const adherenceRate = meter.createUpDownCounter('adherence_rate', {
  description: 'Current medication adherence rate (0-100)',
})

// Histogram for Latency
export const notificationLatency = meter.createHistogram('notification_latency', {
  description: 'Time taken to process and send a notification',
  unit: 'ms',
})

// Helper functions for easy tracking
let takenCount = 0
let missedCount = 0

export const trackDoseTaken = (type: 'planned' | 'adhoc' = 'planned') => {
  dosesTakenTotal.add(1, { 'dose.type': type })
  takenCount++
  updateAdherenceRate()
}


export const trackDoseMissed = () => {
  dosesMissedTotal.add(1)
  missedCount++
  updateAdherenceRate()
}

function updateAdherenceRate() {
  const total = takenCount + missedCount
  if (total === 0) return
  
  const rate = (takenCount / total) * 100
  // Note: UpDownCounter used as a pseudo-gauge for current rate
  // In a real Prometheus setup, this calculation often happens in PromQL
  adherenceRate.add(rate - (currentRate || 0))
  currentRate = rate
}

let currentRate = 0
