import { IsString, IsDateString, IsOptional, IsBoolean, IsObject, IsEnum, MaxLength } from 'class-validator'
import { EventType } from '@prisma/client'

export class CreateEventDto {
  @IsEnum(EventType)
  type: EventType

  @IsDateString()
  eventDate: string

  @IsOptional()
  @IsBoolean()
  result?: boolean

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string

  @IsOptional()
  @IsObject()
  extraData?: Record<string, unknown>
}
