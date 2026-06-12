import { Injectable, ForbiddenException } from '@nestjs/common'
import { TipoFazenda } from '@prisma/client'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { CreateFazendaDto } from './dto/criar-fazenda.dto'
import { calculateRemainingDays, classifyAlertUrgency } from '@cria-viva/shared'

@Injectable()
export class FazendasService {
  constructor(private prisma: PrismaService) {}

  async list(usuarioId: string) {
    const members = await this.prisma.usuarioFazenda.findMany({
      where: { usuarioId },
      include: { fazenda: true },
    })
    return members.map((m) => ({ ...m.fazenda, papel: m.papel }))
  }

  async create(dto: CreateFazendaDto, usuarioId: string) {
    const farm = await this.prisma.fazenda.create({
      data: {
        nome: dto.nome,
        cidade: dto.cidade,
        estado: dto.estado,
        tipo: (dto.tipo ?? 'CORTE') as TipoFazenda,
      },
    })
    await this.prisma.usuarioFazenda.create({
      data: { usuarioId, fazendaId: farm.id, papel: 'ADMIN' },
    })
    return farm
  }

  async dashboard(fazendaId: string, usuarioId: string) {
    await this.checkAccess(fazendaId, usuarioId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in7Days = new Date(today)
    in7Days.setDate(in7Days.getDate() + 7)
    const in30Days = new Date(today)
    in30Days.setDate(in30Days.getDate() + 30)

    const [totalActive, pregnancies] = await Promise.all([
      this.prisma.animal.count({
        where: { fazendaId, status: { in: ['ATIVA', 'SECA'] } },
      }),
      this.prisma.gestacao.findMany({
        where: {
          status: { in: ['SUSPEITA', 'CONFIRMADA'] },
          animal: { fazendaId },
        },
        include: { animal: true },
        orderBy: { dpp: 'asc' },
      }),
    ])

    const birthsThisWeek = pregnancies.filter(
      (g) => g.dpp >= today && g.dpp <= in7Days,
    )
    const birthsThisMonth = pregnancies.filter(
      (g) => g.dpp >= today && g.dpp <= in30Days,
    )
    const totalOpen = await this.prisma.animal.count({
      where: {
        fazendaId,
        status: 'ATIVA',
        gestacoes: { none: { status: { in: ['SUSPEITA', 'CONFIRMADA'] } } },
      },
    })

    const upcomingBirths = pregnancies.slice(0, 10).map((g) => {
      const daysRemaining = calculateRemainingDays(g.dpp)
      return {
        animalId: g.animalId,
        earTag: g.animal.brinco,
        animalName: g.animal.nome ?? undefined,
        dpp: g.dpp.toISOString(),
        daysRemaining,
        urgency: classifyAlertUrgency(daysRemaining),
        status: g.status,
      }
    })

    return {
      totalActive,
      totalPregnant: pregnancies.length,
      birthsThisWeek: birthsThisWeek.length,
      birthsThisMonth: birthsThisMonth.length,
      totalOpen,
      upcomingBirths,
    }
  }

  private async checkAccess(fazendaId: string, usuarioId: string) {
    const member = await this.prisma.usuarioFazenda.findUnique({
      where: { usuarioId_fazendaId: { usuarioId, fazendaId } },
    })
    if (!member) throw new ForbiddenException('Acesso negado')
  }
}
