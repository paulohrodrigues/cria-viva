export const BOVINE_GESTATION_DAYS = 283
export const BOVINE_MIN_GESTATION_DAYS = 240

export const ALERT_DAYS: Record<string, number> = {
  PRE_CALVING_13D: 13,
  PRE_CALVING_7D: 7,
  PRE_CALVING_3D: 3,
  DUE_DATE: 0,
  OVERDUE_NO_CALVING: -3,
}

// User-facing labels (pt-BR)
export const EVENT_TYPE_LABELS: Record<string, string> = {
  HEAT: 'Cio detectado',
  INSEMINATION: 'Inseminação Artificial',
  NATURAL_BREEDING: 'Monta Natural',
  PREGNANCY_DIAGNOSIS: 'Diagnóstico de Gestação',
  CALVING: 'Parto',
  WEANING: 'Desmame',
  CULLING: 'Descarte',
}

export const ANIMAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  DRY: 'Seca',
  CULLED: 'Descartada',
  SOLD: 'Vendida',
  DEAD: 'Morta',
}

export const PREGNANCY_STATUS_LABELS: Record<string, string> = {
  SUSPECTED: 'Suspeita',
  CONFIRMED: 'Confirmada',
  ABORTED: 'Abortada',
  COMPLETED: 'Concluída',
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
