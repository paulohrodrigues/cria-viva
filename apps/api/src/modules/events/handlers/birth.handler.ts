import { Injectable, BadRequestException } from '@nestjs/common'
import { ReproductiveEvent } from '@prisma/client'
import { PrismaService } from '../../../shared/prisma/prisma.service'
import { AlertsService } from '../../alerts/alerts.service'
import { CreateEventDto } from '../dto/create-event.dto'
import { BOVINE_MIN_GESTATION_DAYS } from '@cria-viva/shared'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireActivePregnancy } from './state-guard'

const MS_PER_DAY = 1000 * 60 * 60 * 24

@Injectable()
export class BirthHandler implements EventHandler {
  constructor(
    private prisma: PrismaService,
    private alerts: AlertsService,
  ) {}

  async validate(context: ValidationContext) {
    requireActivePregnancy(context, 'Parto só pode ser registrado quando há gestação ativa.')

    const daysSinceBreeding = Math.floor(
      (context.eventDate.getTime() - context.activePregnancy!.breedingDate.getTime()) / MS_PER_DAY,
    )
    if (daysSinceBreeding < BOVINE_MIN_GESTATION_DAYS) {
      throw new BadRequestException(
        `Parto inválido: apenas ${daysSinceBreeding} dias após a cobertura. O mínimo biológico é ${BOVINE_MIN_GESTATION_DAYS} dias.`,
      )
    }
  }

  async apply(animalId: string, _eventId: string, dto: CreateEventDto) {
    const active = await this.prisma.pregnancy.findMany({
      where: { animalId, status: { in: ['SUSPECTED', 'CONFIRMED'] } },
    })
    await Promise.all(
      active.map(async (p) => {
        await this.alerts.cancelPregnancyAlerts(p.id)
        await this.prisma.pregnancy.update({
          where: { id: p.id },
          data: { status: 'COMPLETED', actualCalvingDate: new Date(dto.eventDate) },
        })
      }),
    )
  }

  async revert(event: ReproductiveEvent) {
    const dayStart = new Date(event.eventDate.toDateString())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const completed = await this.prisma.pregnancy.findMany({
      where: {
        animalId: event.animalId,
        status: 'COMPLETED',
        actualCalvingDate: { gte: dayStart, lt: dayEnd },
      },
    })
    await Promise.all(
      completed.map(async (p) => {
        await this.prisma.pregnancy.update({
          where: { id: p.id },
          data: { status: 'CONFIRMED', actualCalvingDate: null },
        })
        await this.alerts.createAlertsForPregnancy(p.id)
      }),
    )
  }
}
