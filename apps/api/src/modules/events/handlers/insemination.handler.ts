import { Injectable } from '@nestjs/common'
import { ReproductiveEvent } from '@prisma/client'
import { PrismaService } from '../../../shared/prisma/prisma.service'
import { AlertsService } from '../../alerts/alerts.service'
import { CreateEventDto } from '../dto/create-event.dto'
import { calculateDueDate } from '@cria-viva/shared'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireNoActivePregnancy } from './state-guard'

@Injectable()
export class InseminationHandler implements EventHandler {
  constructor(
    private prisma: PrismaService,
    private alerts: AlertsService,
  ) {}

  async validate(context: ValidationContext) {
    requireNoActivePregnancy(
      context,
      'Animal já possui gestação ativa. Registre um Diagnóstico de Gestação negativo antes de nova cobertura.',
    )
  }

  async apply(animalId: string, eventId: string, dto: CreateEventDto) {
    const pregnancy = await this.prisma.pregnancy.create({
      data: {
        animalId,
        breedingEventId: eventId,
        breedingDate: new Date(dto.eventDate),
        dueDate: calculateDueDate(new Date(dto.eventDate)),
        status: 'SUSPECTED',
      },
    })
    await this.alerts.createAlertsForPregnancy(pregnancy.id)
  }

  async revert(event: ReproductiveEvent) {
    const pregnancy = await this.prisma.pregnancy.findFirst({
      where: { breedingEventId: event.id },
    })
    if (!pregnancy) return
    await this.alerts.cancelPregnancyAlerts(pregnancy.id)
    await this.prisma.pregnancy.delete({ where: { id: pregnancy.id } })
  }
}
