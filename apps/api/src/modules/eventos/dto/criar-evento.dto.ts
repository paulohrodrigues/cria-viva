import { IsString, IsDateString, IsOptional, IsBoolean, IsObject, IsEnum, MaxLength } from 'class-validator'
import { TipoEvento } from '@prisma/client'

export class CreateEventoDto {
  @IsEnum(TipoEvento)
  tipo: TipoEvento

  @IsDateString()
  dataEvento: string

  @IsOptional()
  @IsBoolean()
  resultado?: boolean

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string

  @IsOptional()
  @IsObject()
  dadosExtras?: Record<string, unknown>
}
