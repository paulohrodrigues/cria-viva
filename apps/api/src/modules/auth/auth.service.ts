import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuario.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email já cadastrado')

    const passwordHash = await bcrypt.hash(dto.senha, 12)
    const user = await this.prisma.usuario.create({
      data: { nome: dto.nome, email: dto.email, telefone: dto.telefone, senhaHash: passwordHash },
    })

    const token = this.jwt.sign({ sub: user.id, email: user.email })
    return { token, user: { id: user.id, nome: user.nome, email: user.email } }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    const valid = await bcrypt.compare(dto.senha, user.senhaHash)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    const token = this.jwt.sign({ sub: user.id, email: user.email })
    return { token, user: { id: user.id, nome: user.nome, email: user.email } }
  }

  async getProfile(usuarioId: string) {
    return this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
      select: { id: true, nome: true, email: true, telefone: true, criadoEm: true },
    })
  }

  async updateProfile(usuarioId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { nome: dto.nome, telefone: dto.telefone ?? null },
      select: { id: true, nome: true, email: true, telefone: true },
    })
    return updated
  }
}
