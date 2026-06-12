import { Injectable } from '@nestjs/common'
import { EventoReprodutivo } from '@prisma/client'
import { PrismaService } from '../../../shared/prisma/prisma.service'
import { AlertasService } from '../../alertas/alertas.service'
import { CreateEventoDto } from '../dto/criar-evento.dto'
import { calculateDueDate } from '@cria-viva/shared'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireNoActivePregnancy } from './state-guard'

@Injectable()
export class InseminationHandler implements EventHandler {
  constructor(
    private prisma: PrismaService,
    private alertas: AlertasService,
  ) {}

  async validate(context: ValidationContext) {
    requireNoActivePregnancy(
      context,
      'Animal já possui gestação ativa. Registre um Diagnóstico de Gestação negativo antes de nova cobertura.',
    )
  }

  async apply(animalId: string, eventId: string, dto: CreateEventoDto) {
    const pregnancy = await this.prisma.gestacao.create({
      data: {
        animalId,
        eventoCoberturaId: eventId,
        dataCobertura: new Date(dto.dataEvento),
        dpp: calculateDueDate(new Date(dto.dataEvento)),
        status: 'SUSPEITA',
      },
    })
    await this.alertas.createAlertsForPregnancy(pregnancy.id)
  }

  async revert(event: EventoReprodutivo) {
    const pregnancy = await this.prisma.gestacao.findFirst({
      where: { eventoCoberturaId: event.id },
    })
    if (!pregnancy) return
    await this.alertas.cancelPregnancyAlerts(pregnancy.id)
    await this.prisma.gestacao.delete({ where: { id: pregnancy.id } })
  }
}
