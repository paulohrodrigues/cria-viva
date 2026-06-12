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
import { AnimalStatus } from '@prisma/client'

export class CreateAnimalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  earTag: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(5000)
  weightKg?: number

  @IsOptional()
  @IsEnum(AnimalStatus)
  status?: AnimalStatus

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string
}
