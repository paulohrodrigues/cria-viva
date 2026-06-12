import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome: string

  @IsEmail()
  @MaxLength(255)
  email: string

  // bcrypt trunca em 72 bytes — limitar evita falsa sensação de entropia extra
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  senha: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string
}
