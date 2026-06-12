import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { AlertType } from '@prisma/client'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { calculateRemainingDays } from '@cria-viva/shared'

const ALERT_DAYS_LIST = [13, 7, 3, 0, -3] as const

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name)

  constructor(
    private prisma: PrismaService,
    @InjectQueue('alerts') private alertsQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async processDailyAlerts() {
    this.logger.log('Processing daily pregnancy alerts...')

    const pregnancies = await this.prisma.pregnancy.findMany({
      where: {
        status: { in: ['SUSPECTED', 'CONFIRMED'] },
      },
      include: {
        animal: { include: { farm: true } },
        alerts: true,
      },
    })

    let totalScheduled = 0

    for (const pregnancy of pregnancies) {
      const daysRemaining = calculateRemainingDays(pregnancy.dueDate)

      for (const alertDay of ALERT_DAYS_LIST) {
        if (daysRemaining !== alertDay) continue

        const alertType = this.daysToAlertType(alertDay)
        const alreadySent = pregnancy.alerts.some(
          (a) => a.type === alertType && a.status === 'SENT',
        )

        if (alreadySent) continue

        const alert = await this.prisma.alert.create({
          data: {
            pregnancyId: pregnancy.id,
            farmId: pregnancy.animal.farmId,
            type: alertType,
            scheduledFor: new Date(),
            recipients: [],
          },
        })

        await this.alertsQueue.add('send-push', {
          alertId: alert.id,
          farmId: pregnancy.animal.farmId,
          animalEarTag: pregnancy.animal.earTag,
          animalName: pregnancy.animal.name,
          farmName: pregnancy.animal.farm.name,
          dueDate: pregnancy.dueDate,
          daysRemaining,
          type: alertType,
        })

        totalScheduled++
      }
    }

    this.logger.log(`${totalScheduled} alerts scheduled for delivery`)
  }

  async createAlertsForPregnancy(pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancy.findUniqueOrThrow({
      where: { id: pregnancyId },
      include: { animal: true },
    })

    const types: AlertType[] = ['PRE_CALVING_13D', 'PRE_CALVING_7D', 'PRE_CALVING_3D', 'DUE_DATE', 'OVERDUE_NO_CALVING']
    const daysPerType: Record<AlertType, number> = { PRE_CALVING_13D: 13, PRE_CALVING_7D: 7, PRE_CALVING_3D: 3, DUE_DATE: 0, OVERDUE_NO_CALVING: -3, HEAT_RETURN: 21 }

    for (const type of types) {
      const triggerDate = new Date(pregnancy.dueDate)
      triggerDate.setDate(triggerDate.getDate() - daysPerType[type])

      if (triggerDate > new Date()) {
        await this.prisma.alert.create({
          data: {
            pregnancyId,
            farmId: pregnancy.animal.farmId,
            type,
            scheduledFor: triggerDate,
            recipients: [],
          },
        })
      }
    }
  }

  async cancelPregnancyAlerts(pregnancyId: string) {
    await this.prisma.alert.updateMany({
      where: { pregnancyId, status: 'PENDING' },
      data: { status: 'CANCELED' },
    })
  }

  private daysToAlertType(days: number): AlertType {
    const map: Record<number, AlertType> = {
      13: 'PRE_CALVING_13D',
      7: 'PRE_CALVING_7D',
      3: 'PRE_CALVING_3D',
      0: 'DUE_DATE',
      [-3]: 'OVERDUE_NO_CALVING',
    }
    return map[days] ?? 'DUE_DATE'
  }
}
