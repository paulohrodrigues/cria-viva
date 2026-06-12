import { Injectable } from '@nestjs/common'
import { EventoReprodutivo } from '@prisma/client'
import { PrismaService } from '../../../shared/prisma/prisma.service'
import { AlertasService } from '../../alertas/alertas.service'
import { CreateEventoDto } from '../dto/criar-evento.dto'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireActivePregnancy } from './state-guard'

@Injectable()
export class DiagnosisHandler implements EventHandler {
  constructor(
    private prisma: PrismaService,
    private alertas: AlertasService,
  ) {}

  async validate(context: ValidationContext) {
    requireActivePregnancy(
      context,
      'Diagnóstico de gestação só pode ser registrado quando há cobertura ativa (IA ou Monta).',
    )
  }

  async apply(animalId: string, _eventId: string, dto: CreateEventoDto) {
    if (dto.resultado === true) {
      await this.prisma.gestacao.updateMany({
        where: { animalId, status: 'SUSPEITA' },
        data: { status: 'CONFIRMADA' },
      })
      return
    }
    if (dto.resultado === false) {
      const active = await this.prisma.gestacao.findMany({
        where: { animalId, status: { in: ['SUSPEITA', 'CONFIRMADA'] } },
      })
      await Promise.all(active.map((g) => this.alertas.cancelPregnancyAlerts(g.id)))
      await this.prisma.gestacao.updateMany({
        where: { animalId, status: { in: ['SUSPEITA', 'CONFIRMADA'] } },
        data: { status: 'ABORTADA' },
      })
    }
    // resultado === undefined: inconclusivo — sem alteração de estado
  }

  async revert(event: EventoReprodutivo) {
    if (event.resultado === true) {
      await this.prisma.gestacao.updateMany({
        where: { animalId: event.animalId, status: 'CONFIRMADA' },
        data: { status: 'SUSPEITA' },
      })
      return
    }
    if (event.resultado === false) {
      const aborted = await this.prisma.gestacao.findMany({
        where: { animalId: event.animalId, status: 'ABORTADA' },
      })
      await Promise.all(
        aborted.map(async (g) => {
          await this.prisma.gestacao.update({ where: { id: g.id }, data: { status: 'SUSPEITA' } })
          await this.alertas.createAlertsForPregnancy(g.id)
        }),
      )
    }
  }
}
