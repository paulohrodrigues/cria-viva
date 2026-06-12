import { IsString, IsOptional, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  nome: string

  @IsString()
  @IsOptional()
  telefone?: string
}
