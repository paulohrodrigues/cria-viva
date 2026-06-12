import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @IsEmail()
  @MaxLength(255)
  email: string

  // bcrypt truncates at 72 bytes — capping avoids a false sense of extra entropy
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string
}
