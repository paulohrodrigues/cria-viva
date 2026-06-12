export const BOVINE_GESTATION_DAYS = 283
export const BOVINE_MIN_GESTATION_DAYS = 240

export const ALERT_DAYS: Record<string, number> = {
  PRE_PARTO_13D: 13,
  PRE_PARTO_7D: 7,
  PRE_PARTO_3D: 3,
  DPP: 0,
  POS_DPP_SEM_REGISTRO: -3,
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  CIO: 'Cio detectado',
  IA: 'Inseminação Artificial',
  MONTA: 'Monta Natural',
  DIAGNOSTICO_GESTACAO: 'Diagnóstico de Gestação',
  PARTO: 'Parto',
  DESMAME: 'Desmame',
  DESCARTE: 'Descarte',
}

export const ANIMAL_STATUS_LABELS: Record<string, string> = {
  ATIVA: 'Ativa',
  SECA: 'Seca',
  DESCARTADA: 'Descartada',
  VENDIDA: 'Vendida',
  MORTA: 'Morta',
}

export const PREGNANCY_STATUS_LABELS: Record<string, string> = {
  SUSPEITA: 'Suspeita',
  CONFIRMADA: 'Confirmada',
  ABORTADA: 'Abortada',
  CONCLUIDA: 'Concluída',
}

export const BOVINE_BREEDS = [
  'Nelore',
  'Angus',
  'Brahman',
  'Girolando',
  'Holandês',
  'Gir',
  'Gir Leiteiro',
  'Simental',
  'Charolês',
  'Limousin',
  'Senepol',
  'Tabapuã',
  'Canchim',
  'Guzerá',
  'Indubrasil',
  'Mestiço',
  'Outro',
]
