import { Injectable, BadRequestException } from '@nestjs/common'
import { EventoReprodutivo } from '@prisma/client'
import { PrismaService } from '../../../shared/prisma/prisma.service'
import { AlertasService } from '../../alertas/alertas.service'
import { CreateEventoDto } from '../dto/criar-evento.dto'
import { BOVINE_MIN_GESTATION_DAYS } from '@cria-viva/shared'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireActivePregnancy } from './state-guard'

const MS_PER_DAY = 1000 * 60 * 60 * 24

@Injectable()
export class BirthHandler implements EventHandler {
  constructor(
    private prisma: PrismaService,
    private alertas: AlertasService,
  ) {}

  async validate(context: ValidationContext) {
    requireActivePregnancy(context, 'Parto só pode ser registrado quando há gestação ativa.')

    const daysSinceCoverage = Math.floor(
      (context.eventDate.getTime() - context.activePregnancy!.dataCobertura.getTime()) / MS_PER_DAY,
    )
    if (daysSinceCoverage < BOVINE_MIN_GESTATION_DAYS) {
      throw new BadRequestException(
        `Parto inválido: apenas ${daysSinceCoverage} dias após a cobertura. O mínimo biológico é ${BOVINE_MIN_GESTATION_DAYS} dias.`,
      )
    }
  }

  async apply(animalId: string, _eventId: string, dto: CreateEventoDto) {
    const active = await this.prisma.gestacao.findMany({
      where: { animalId, status: { in: ['SUSPEITA', 'CONFIRMADA'] } },
    })
    await Promise.all(
      active.map(async (g) => {
        await this.alertas.cancelPregnancyAlerts(g.id)
        await this.prisma.gestacao.update({
          where: { id: g.id },
          data: { status: 'CONCLUIDA', dataPartoReal: new Date(dto.dataEvento) },
        })
      }),
    )
  }

  async revert(event: EventoReprodutivo) {
    const dayStart = new Date(event.dataEvento.toDateString())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const completed = await this.prisma.gestacao.findMany({
      where: {
        animalId: event.animalId,
        status: 'CONCLUIDA',
        dataPartoReal: { gte: dayStart, lt: dayEnd },
      },
    })
    await Promise.all(
      completed.map(async (g) => {
        await this.prisma.gestacao.update({
          where: { id: g.id },
          data: { status: 'CONFIRMADA', dataPartoReal: null },
        })
        await this.alertas.createAlertsForPregnancy(g.id)
      }),
    )
  }
}
