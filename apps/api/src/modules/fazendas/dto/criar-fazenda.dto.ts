import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator'
import { TipoFazenda } from '@prisma/client'

export class CreateFazendaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidade?: string

  @IsOptional()
  @IsString()
  @MaxLength(2)
  estado?: string

  @IsOptional()
  @IsEnum(TipoFazenda)
  tipo?: TipoFazenda
}
