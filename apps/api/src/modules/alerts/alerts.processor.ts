import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { PushService } from '../push/push.service'

@Processor('alerts')
export class AlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertsProcessor.name)

  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {
    super()
  }

  async process(job: Job) {
    const { alertId, animalEarTag, animalName, farmName, farmId, dueDate, daysRemaining, type } = job.data

    try {
      const payload = this.buildPayload({ earTag: animalEarTag, name: animalName, farmName, dueDate, daysRemaining, type })

      await this.push.sendToFarm(farmId, payload)

      await this.prisma.alert.update({
        where: { id: alertId },
        data: { status: 'SENT', sentAt: new Date() },
      })

      this.logger.log(`Alert ${type} sent via push — ${animalEarTag}`)
    } catch (err) {
      await this.prisma.alert.update({
        where: { id: alertId },
        data: { status: 'FAILED' },
      })
      this.logger.error(`Failed to send alert ${alertId}: ${err}`)
      throw err
    }
  }

  // Notification titles/bodies are user-facing (pt-BR)
  private buildPayload(params: {
    earTag: string
    name?: string
    farmName: string
    dueDate: Date
    daysRemaining: number
    type: string
  }) {
    const animal = params.name ? `${params.name} (${params.earTag})` : params.earTag
    const dueDateStr = new Date(params.dueDate).toLocaleDateString('pt-BR')

    const titles: Record<string, string> = {
      PRE_CALVING_13D: 'Parto em 13 dias',
      PRE_CALVING_7D: 'Semana do parto',
      PRE_CALVING_3D: 'Parto em 3 dias',
      DUE_DATE: 'DPP — Parto hoje!',
      OVERDUE_NO_CALVING: 'Parto não confirmado',
    }

    const bodies: Record<string, string> = {
      PRE_CALVING_13D: `${animal} — Fazenda ${params.farmName} · DPP ${dueDateStr}`,
      PRE_CALVING_7D: `${animal} está na semana do parto — Fazenda ${params.farmName}`,
      PRE_CALVING_3D: `${animal} deve parir em até 3 dias — Fazenda ${params.farmName}`,
      DUE_DATE: `${animal} tem parto previsto para hoje — Fazenda ${params.farmName}`,
      OVERDUE_NO_CALVING: `O parto de ${animal} ainda não foi registrado — Fazenda ${params.farmName}`,
    }

    return {
      title: titles[params.type] ?? 'CriaViva',
      body: bodies[params.type] ?? animal,
      tag: params.type,
    }
  }
}
