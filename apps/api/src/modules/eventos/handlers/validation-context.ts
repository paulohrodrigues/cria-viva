export type ReproductiveState = 'OPEN' | 'PREGNANT' | 'POSTPARTUM'

export interface ValidationContext {
  state: ReproductiveState
  activePregnancy: { id: string; dataCobertura: Date; status: string } | null
  lastEvent: { tipo: string; dataEvento: Date } | null
  eventDate: Date
}
