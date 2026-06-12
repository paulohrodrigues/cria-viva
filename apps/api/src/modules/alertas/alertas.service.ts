import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { TipoAlerta } from '@prisma/client'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { calculateDueDate, calculateRemainingDays } from '@cria-viva/shared'

const ALERT_DAYS_LIST = [13, 7, 3, 0, -3] as const

@Injectable()
export class AlertasService {
  private readonly logger = new Logger(AlertasService.name)

  constructor(
    private prisma: PrismaService,
    @InjectQueue('alertas') private alertasQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async processDailyAlerts() {
    this.logger.log('Processando alertas diários de gestação...')

    const pregnancies = await this.prisma.gestacao.findMany({
      where: {
        status: { in: ['SUSPEITA', 'CONFIRMADA'] },
      },
      include: {
        animal: { include: { fazenda: true } },
        alertas: true,
      },
    })

    let totalScheduled = 0

    for (const pregnancy of pregnancies) {
      const daysRemaining = calculateRemainingDays(pregnancy.dpp)

      for (const alertDay of ALERT_DAYS_LIST) {
        if (daysRemaining !== alertDay) continue

        const alertType = this.daysToAlertType(alertDay)
        const alreadySent = pregnancy.alertas.some(
          (a) => a.tipo === alertType && a.status === 'ENVIADO',
        )

        if (alreadySent) continue

        const alert = await this.prisma.alerta.create({
          data: {
            gestacaoId: pregnancy.id,
            fazendaId: pregnancy.animal.fazendaId,
            tipo: alertType,
            dataDisparo: new Date(),
            destinatarios: [],
          },
        })

        await this.alertasQueue.add('enviar-push', {
          alertId: alert.id,
          fazendaId: pregnancy.animal.fazendaId,
          animalEarTag: pregnancy.animal.brinco,
          animalName: pregnancy.animal.nome,
          farmName: pregnancy.animal.fazenda.nome,
          dpp: pregnancy.dpp,
          daysRemaining,
          tipo: alertType,
        })

        totalScheduled++
      }
    }

    this.logger.log(`${totalScheduled} alertas agendados para envio`)
  }

  async createAlertsForPregnancy(gestacaoId: string) {
    const pregnancy = await this.prisma.gestacao.findUniqueOrThrow({
      where: { id: gestacaoId },
      include: { animal: true },
    })

    const types: TipoAlerta[] = ['PRE_PARTO_13D', 'PRE_PARTO_7D', 'PRE_PARTO_3D', 'DPP', 'POS_DPP_SEM_REGISTRO']
    const daysPerType: Record<TipoAlerta, number> = { PRE_PARTO_13D: 13, PRE_PARTO_7D: 7, PRE_PARTO_3D: 3, DPP: 0, POS_DPP_SEM_REGISTRO: -3, CIO_RETORNO: 21 }

    for (const type of types) {
      const triggerDate = new Date(pregnancy.dpp)
      triggerDate.setDate(triggerDate.getDate() - daysPerType[type])

      if (triggerDate > new Date()) {
        await this.prisma.alerta.create({
          data: {
            gestacaoId,
            fazendaId: pregnancy.animal.fazendaId,
            tipo: type,
            dataDisparo: triggerDate,
            destinatarios: [],
          },
        })
      }
    }
  }

  async cancelPregnancyAlerts(gestacaoId: string) {
    await this.prisma.alerta.updateMany({
      where: { gestacaoId, status: 'PENDENTE' },
      data: { status: 'CANCELADO' },
    })
  }

  private daysToAlertType(days: number): TipoAlerta {
    const map: Record<number, TipoAlerta> = {
      13: 'PRE_PARTO_13D',
      7: 'PRE_PARTO_7D',
      3: 'PRE_PARTO_3D',
      0: 'DPP',
      [-3]: 'POS_DPP_SEM_REGISTRO',
    }
    return map[days] ?? 'DPP'
  }

}
