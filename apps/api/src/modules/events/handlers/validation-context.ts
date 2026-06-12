export type ReproductiveState = 'OPEN' | 'PREGNANT' | 'POSTPARTUM'

export interface ValidationContext {
  state: ReproductiveState
  activePregnancy: { id: string; breedingDate: Date; status: string } | null
  lastEvent: { type: string; eventDate: Date } | null
  eventDate: Date
}
