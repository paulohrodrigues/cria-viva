import { IsString, IsOptional, IsEnum } from 'class-validator'

export class CreateFazendaDto {
  @IsString()
  nome: string

  @IsOptional()
  @IsString()
  cidade?: string

  @IsOptional()
  @IsString()
  estado?: string

  @IsOptional()
  @IsEnum(['CORTE', 'LEITE', 'MISTO'])
  tipo?: string
}
