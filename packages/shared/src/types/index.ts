export type FarmType = 'BEEF' | 'DAIRY' | 'MIXED'
export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER'
export type AnimalStatus = 'ACTIVE' | 'DRY' | 'CULLED' | 'SOLD' | 'DEAD'
export type EventType =
  | 'HEAT'
  | 'INSEMINATION'
  | 'NATURAL_BREEDING'
  | 'PREGNANCY_DIAGNOSIS'
  | 'CALVING'
  | 'WEANING'
  | 'CULLING'
export type PregnancyStatus = 'SUSPECTED' | 'CONFIRMED' | 'ABORTED' | 'COMPLETED'
export type AlertType =
  | 'HEAT_RETURN'
  | 'PRE_CALVING_13D'
  | 'PRE_CALVING_7D'
  | 'PRE_CALVING_3D'
  | 'DUE_DATE'
  | 'OVERDUE_NO_CALVING'
export type AlertStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELED'

export interface Farm {
  id: string
  name: string
  city?: string
  state?: string
  type: FarmType
  createdAt: string
}

export interface Animal {
  id: string
  farmId: string
  earTag: string
  name?: string
  breed?: string
  birthDate?: string
  weightKg?: number
  status: AnimalStatus
  photoUrl?: string
  notes?: string
  createdAt: string
  activePregnancy?: Pregnancy
}

export interface ReproductiveEvent {
  id: string
  animalId: string
  userId?: string
  type: EventType
  eventDate: string
  result?: boolean
  notes?: string
  extraData?: Record<string, unknown>
  createdAt: string
}

export interface Pregnancy {
  id: string
  animalId: string
  breedingDate: string
  dueDate: string
  actualCalvingDate?: string
  status: PregnancyStatus
  daysRemaining?: number
  createdAt: string
}

export interface Alert {
  id: string
  pregnancyId: string
  farmId: string
  type: AlertType
  scheduledFor: string
  status: AlertStatus
  sentAt?: string
}

export interface DashboardSummary {
  totalActive: number
  totalPregnant: number
  birthsThisWeek: number
  birthsThisMonth: number
  totalOpen: number
  upcomingBirths: UpcomingBirth[]
}

export interface AlertSummary {
  animalId: string
  earTag: string
  animalName?: string
  type: AlertType
  dueDate: string
  daysRemaining: number
}

export interface UpcomingBirth {
  animalId: string
  earTag: string
  animalName?: string
  dueDate: string
  daysRemaining: number
  status: PregnancyStatus
}
