import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsPositive,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator'
import { StatusAnimal } from '@prisma/client'

export class CreateAnimalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  brinco: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  raca?: string

  @IsOptional()
  @IsDateString()
  nascimento?: string

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(5000)
  pesoKg?: number

  @IsOptional()
  @IsEnum(StatusAnimal)
  status?: StatusAnimal

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string
}
