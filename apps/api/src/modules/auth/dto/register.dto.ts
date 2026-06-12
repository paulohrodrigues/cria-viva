import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsString()
  nome: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  senha: string

  @IsOptional()
  @IsString()
  telefone?: string
}
