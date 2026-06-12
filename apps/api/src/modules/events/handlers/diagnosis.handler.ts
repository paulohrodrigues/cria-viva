import { Injectable } from '@nestjs/common'
import { ReproductiveEvent } from '@prisma/client'
import { PrismaService } from '../../../shared/prisma/prisma.service'
import { AlertsService } from '../../alerts/alerts.service'
import { CreateEventDto } from '../dto/create-event.dto'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireActivePregnancy } from './state-guard'

@Injectable()
export class DiagnosisHandler implements EventHandler {
  constructor(
    private prisma: PrismaService,
    private alerts: AlertsService,
  ) {}

  async validate(context: ValidationContext) {
    requireActivePregnancy(
      context,
      'Diagnóstico de gestação só pode ser registrado quando há cobertura ativa (IA ou Monta).',
    )
  }

  async apply(animalId: string, _eventId: string, dto: CreateEventDto) {
    if (dto.result === true) {
      await this.prisma.pregnancy.updateMany({
        where: { animalId, status: 'SUSPECTED' },
        data: { status: 'CONFIRMED' },
      })
      return
    }
    if (dto.result === false) {
      const active = await this.prisma.pregnancy.findMany({
        where: { animalId, status: { in: ['SUSPECTED', 'CONFIRMED'] } },
      })
      await Promise.all(active.map((p) => this.alerts.cancelPregnancyAlerts(p.id)))
      await this.prisma.pregnancy.updateMany({
        where: { animalId, status: { in: ['SUSPECTED', 'CONFIRMED'] } },
        data: { status: 'ABORTED' },
      })
    }
    // result === undefined: inconclusive — no state change
  }

  async revert(event: ReproductiveEvent) {
    if (event.result === true) {
      await this.prisma.pregnancy.updateMany({
        where: { animalId: event.animalId, status: 'CONFIRMED' },
        data: { status: 'SUSPECTED' },
      })
      return
    }
    if (event.result === false) {
      const aborted = await this.prisma.pregnancy.findMany({
        where: { animalId: event.animalId, status: 'ABORTED' },
      })
      await Promise.all(
        aborted.map(async (p) => {
          await this.prisma.pregnancy.update({ where: { id: p.id }, data: { status: 'SUSPECTED' } })
          await this.alerts.createAlertsForPregnancy(p.id)
        }),
      )
    }
  }
}
