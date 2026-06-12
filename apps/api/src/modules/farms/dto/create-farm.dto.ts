import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator'
import { FarmType } from '@prisma/client'

export class CreateFarmDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string

  @IsOptional()
  @IsEnum(FarmType)
  type?: FarmType
}
