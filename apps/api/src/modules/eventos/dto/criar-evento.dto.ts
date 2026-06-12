import { IsString, IsDateString, IsOptional, IsBoolean, IsObject, IsEnum } from 'class-validator'

export class CreateEventoDto {
  @IsEnum(['CIO', 'IA', 'MONTA', 'DIAGNOSTICO_GESTACAO', 'PARTO', 'DESMAME', 'DESCARTE'])
  tipo: string

  @IsDateString()
  dataEvento: string

  @IsOptional()
  @IsBoolean()
  resultado?: boolean

  @IsOptional()
  @IsString()
  observacoes?: string

  @IsOptional()
  @IsObject()
  dadosExtras?: Record<string, unknown>
}
