import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  async reproductiveEfficiency(fazendaId: string, usuarioId: string) {
    await this.checkAccess(fazendaId, usuarioId)

    const [totalIAs, pregnancies, diagnosticosPositivos, partos, openCowCount] = await Promise.all([
      this.prisma.eventoReprodutivo.count({
        where: { animal: { fazendaId }, tipo: { in: ['IA', 'MONTA'] } },
      }),
      this.prisma.gestacao.count({
        where: {
          animal: { fazendaId },
          status: { in: ['SUSPEITA', 'CONFIRMADA', 'CONCLUIDA'] },
        },
      }),
      this.prisma.eventoReprodutivo.count({
        where: { animal: { fazendaId }, tipo: 'DIAGNOSTICO_GESTACAO', resultado: true },
      }),
      this.prisma.gestacao.count({
        where: { animal: { fazendaId }, status: 'CONCLUIDA' },
      }),
      this.prisma.animal.count({
        where: {
          fazendaId,
          status: 'ATIVA',
          gestacoes: { none: { status: { in: ['SUSPEITA', 'CONFIRMADA'] } } },
        },
      }),
    ])

    const conceptionRate = totalIAs > 0 ? Math.round((pregnancies / totalIAs) * 100) : 0

    return {
      totalIAs,
      diagnosticosPositivos,
      conceptionRate,
      totalPartos: partos,
      openCows: openCowCount,
    }
  }

  async openCows(fazendaId: string, usuarioId: string) {
    await this.checkAccess(fazendaId, usuarioId)

    const animals = await this.prisma.animal.findMany({
      where: {
        fazendaId,
        status: 'ATIVA',
        gestacoes: { none: { status: { in: ['SUSPEITA', 'CONFIRMADA'] } } },
      },
      include: {
        eventos: {
          where: { tipo: { in: ['IA', 'MONTA', 'PARTO'] } },
          orderBy: { dataEvento: 'desc' },
          take: 1,
        },
      },
      orderBy: { brinco: 'asc' },
    })

    return animals.map((a) => ({
      id: a.id,
      brinco: a.brinco,
      nome: a.nome,
      ultimoEvento: a.eventos[0]?.dataEvento ?? null,
      diasAberta: a.eventos[0]
        ? Math.floor((Date.now() - new Date(a.eventos[0].dataEvento).getTime()) / 86400000)
        : null,
    }))
  }

  private async checkAccess(fazendaId: string, usuarioId: string) {
    const member = await this.prisma.usuarioFazenda.findUnique({
      where: { usuarioId_fazendaId: { usuarioId, fazendaId } },
    })
    if (!member) throw new ForbiddenException('Acesso negado')
  }
}
