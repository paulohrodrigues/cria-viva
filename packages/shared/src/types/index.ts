export type TipoFazenda = 'CORTE' | 'LEITE' | 'MISTO'
export type PapelUsuario = 'ADMIN' | 'EDITOR' | 'VISUALIZADOR'
export type StatusAnimal = 'ATIVA' | 'SECA' | 'DESCARTADA' | 'VENDIDA' | 'MORTA'
export type TipoEvento = 'CIO' | 'IA' | 'MONTA' | 'DIAGNOSTICO_GESTACAO' | 'PARTO' | 'DESMAME' | 'DESCARTE'
export type StatusGestacao = 'SUSPEITA' | 'CONFIRMADA' | 'ABORTADA' | 'CONCLUIDA'
export type TipoAlerta = 'CIO_RETORNO' | 'PRE_PARTO_13D' | 'PRE_PARTO_7D' | 'PRE_PARTO_3D' | 'DPP' | 'POS_DPP_SEM_REGISTRO'
export type StatusAlerta = 'PENDENTE' | 'ENVIADO' | 'FALHOU' | 'CANCELADO'

export interface Fazenda {
  id: string
  nome: string
  cidade?: string
  estado?: string
  tipo: TipoFazenda
  criadoEm: string
}

export interface Animal {
  id: string
  fazendaId: string
  brinco: string
  nome?: string
  raca?: string
  nascimento?: string
  pesoKg?: number
  status: StatusAnimal
  fotoUrl?: string
  observacoes?: string
  criadoEm: string
  activePregnancy?: Pregnancy
}

export interface EventoReprodutivo {
  id: string
  animalId: string
  usuarioId?: string
  tipo: TipoEvento
  dataEvento: string
  resultado?: boolean
  observacoes?: string
  dadosExtras?: Record<string, unknown>
  criadoEm: string
}

export interface Pregnancy {
  id: string
  animalId: string
  dataCobertura: string
  dpp: string
  dataPartoReal?: string
  status: StatusGestacao
  daysRemaining?: number
  criadoEm: string
}

export interface Alerta {
  id: string
  gestacaoId: string
  fazendaId: string
  tipo: TipoAlerta
  dataDisparo: string
  status: StatusAlerta
  enviadoEm?: string
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
  brinco: string
  animalName?: string
  tipo: TipoAlerta
  dpp: string
  daysRemaining: number
}

export interface UpcomingBirth {
  animalId: string
  earTag: string
  animalName?: string
  dpp: string
  daysRemaining: number
  status: StatusGestacao
}
