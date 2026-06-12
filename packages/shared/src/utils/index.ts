import { BOVINE_GESTATION_DAYS } from '../constants'

export function calculateDueDate(coverageDate: Date): Date {
  const dueDate = new Date(coverageDate)
  dueDate.setDate(dueDate.getDate() + BOVINE_GESTATION_DAYS)
  return dueDate
}

export function calculateRemainingDays(dpp: Date | string): number {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const dueDateNorm = new Date(dpp)
  dueDateNorm.setUTCHours(0, 0, 0, 0)
  return Math.ceil((dueDateNorm.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatEarTag(earTag: string): string {
  return earTag.toUpperCase().trim()
}

export function classifyAlertUrgency(daysRemaining: number): 'critico' | 'alto' | 'medio' | 'baixo' {
  if (daysRemaining <= 0) return 'critico'
  if (daysRemaining <= 3) return 'critico'
  if (daysRemaining <= 7) return 'alto'
  if (daysRemaining <= 13) return 'medio'
  return 'baixo'
}
