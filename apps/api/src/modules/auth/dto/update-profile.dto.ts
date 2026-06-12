import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string
}
