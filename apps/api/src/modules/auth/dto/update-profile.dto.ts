import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefone?: string
}
