import { Injectable, ForbiddenException } from '@nestjs/common'
import { StatusAnimal } from '@prisma/client'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { CreateAnimalDto } from './dto/criar-animal.dto'
import { calculateRemainingDays } from '@cria-viva/shared'

@Injectable()
export class AnimaisService {
  constructor(private prisma: PrismaService) {}

  async list(fazendaId: string, usuarioId: string) {
    await this.checkAccess(fazendaId, usuarioId)

    const animals = await this.prisma.animal.findMany({
      where: { fazendaId, status: { not: 'MORTA' } },
      include: {
        gestacoes: {
          where: { status: { in: ['SUSPEITA', 'CONFIRMADA'] } },
          orderBy: { criadoEm: 'desc' },
          take: 1,
        },
      },
      orderBy: { brinco: 'asc' },
    })

    return animals.map((a) => ({
      ...a,
      activePregnancy: a.gestacoes[0]
        ? {
            ...a.gestacoes[0],
            daysRemaining: calculateRemainingDays(a.gestacoes[0].dpp),
          }
        : null,
    }))
  }

  async findById(id: string, usuarioId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({
      where: { id },
      include: {
        gestacoes: {
          include: { alertas: true },
          orderBy: { criadoEm: 'desc' },
        },
        eventos: {
          orderBy: { dataEvento: 'desc' },
          take: 20,
        },
      },
    })

    await this.checkAccess(animal.fazendaId, usuarioId)
    return animal
  }

  async create(fazendaId: string, dto: CreateAnimalDto, usuarioId: string) {
    await this.checkAccess(fazendaId, usuarioId)
    return this.prisma.animal.create({
      data: {
        fazendaId,
        brinco: dto.brinco,
        nome: dto.nome,
        raca: dto.raca,
        nascimento: dto.nascimento ? new Date(dto.nascimento) : undefined,
        pesoKg: dto.pesoKg,
        status: dto.status as StatusAnimal | undefined,
        observacoes: dto.observacoes,
      },
    })
  }

  async update(id: string, dto: Partial<CreateAnimalDto>, usuarioId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id } })
    await this.checkAccess(animal.fazendaId, usuarioId)
    return this.prisma.animal.update({
      where: { id },
      data: {
        brinco: dto.brinco,
        nome: dto.nome,
        raca: dto.raca,
        nascimento: dto.nascimento ? new Date(dto.nascimento) : undefined,
        pesoKg: dto.pesoKg,
        status: dto.status as StatusAnimal | undefined,
        observacoes: dto.observacoes,
      },
    })
  }

  private async checkAccess(fazendaId: string, usuarioId: string) {
    const member = await this.prisma.usuarioFazenda.findUnique({
      where: { usuarioId_fazendaId: { usuarioId, fazendaId } },
    })
    if (!member) throw new ForbiddenException('Acesso negado a esta fazenda')
  }
}
