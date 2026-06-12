import { BOVINE_GESTATION_DAYS } from '../constants'

export function calculateDueDate(breedingDate: Date): Date {
  const dueDate = new Date(breedingDate)
  dueDate.setDate(dueDate.getDate() + BOVINE_GESTATION_DAYS)
  return dueDate
}

export function calculateRemainingDays(dueDate: Date | string): number {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const dueDateNorm = new Date(dueDate)
  dueDateNorm.setUTCHours(0, 0, 0, 0)
  return Math.ceil((dueDateNorm.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatEarTag(earTag: string): string {
  return earTag.toUpperCase().trim()
}

export type AlertUrgency = 'critical' | 'high' | 'medium' | 'low'

export function classifyAlertUrgency(daysRemaining: number): AlertUrgency {
  if (daysRemaining <= 3) return 'critical'
  if (daysRemaining <= 7) return 'high'
  if (daysRemaining <= 13) return 'medium'
  return 'low'
}
