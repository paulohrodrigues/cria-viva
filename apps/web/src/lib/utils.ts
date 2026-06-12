import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('pt-br')
dayjs.extend(relativeTime)
dayjs.extend(utc)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return dayjs.utc(date).format('DD/MM/YYYY')
}

export function formatRelativeDate(date: string | Date): string {
  return dayjs(date).fromNow()
}

export function daysToText(days: number): string {
  if (days < 0) return `${Math.abs(days)} dias atrás`
  if (days === 0) return 'hoje'
  if (days === 1) return 'amanhã'
  return `em ${days} dias`
}

export function urgencyToBadge(urgency: string): string {
  const map: Record<string, string> = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-ok',
  }
  return map[urgency] ?? 'badge-ok'
}
