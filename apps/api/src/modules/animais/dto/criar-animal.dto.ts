import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator'

export class CreateAnimalDto {
  @IsString()
  brinco: string

  @IsOptional()
  @IsString()
  nome?: string

  @IsOptional()
  @IsString()
  raca?: string

  @IsOptional()
  @IsDateString()
  nascimento?: string

  @IsOptional()
  @IsNumber()
  pesoKg?: number

  @IsOptional()
  @IsEnum(['ATIVA', 'SECA', 'DESCARTADA', 'VENDIDA', 'MORTA'])
  status?: string

  @IsOptional()
  @IsString()
  observacoes?: string
}
