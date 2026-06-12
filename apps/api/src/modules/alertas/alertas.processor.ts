import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { PushService } from '../push/push.service'

@Processor('alertas')
export class AlertasProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertasProcessor.name)

  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {
    super()
  }

  async process(job: Job) {
    const { alertId, animalEarTag, animalName, farmName, fazendaId, dpp, daysRemaining, tipo } = job.data

    try {
      const payload = this.buildPayload({ earTag: animalEarTag, nome: animalName, farmName, dpp, daysRemaining, tipo })

      await this.push.sendToFarm(fazendaId, payload)

      await this.prisma.alerta.update({
        where: { id: alertId },
        data: { status: 'ENVIADO', enviadoEm: new Date() },
      })

      this.logger.log(`Alerta ${tipo} enviado via push — ${animalEarTag}`)
    } catch (err) {
      await this.prisma.alerta.update({
        where: { id: alertId },
        data: { status: 'FALHOU' },
      })
      this.logger.error(`Falha ao enviar alerta ${alertId}: ${err}`)
      throw err
    }
  }

  private buildPayload(params: {
    earTag: string
    nome?: string
    farmName: string
    dpp: Date
    daysRemaining: number
    tipo: string
  }) {
    const animal = params.nome ? `${params.nome} (${params.earTag})` : params.earTag
    const dppStr = new Date(params.dpp).toLocaleDateString('pt-BR')

    const titles: Record<string, string> = {
      PRE_PARTO_13D: 'Parto em 13 dias',
      PRE_PARTO_7D: 'Semana do parto',
      PRE_PARTO_3D: 'Parto em 3 dias',
      DPP: 'DPP — Parto hoje!',
      POS_DPP_SEM_REGISTRO: 'Parto não confirmado',
    }

    const bodies: Record<string, string> = {
      PRE_PARTO_13D: `${animal} — Fazenda ${params.farmName} · DPP ${dppStr}`,
      PRE_PARTO_7D: `${animal} está na semana do parto — Fazenda ${params.farmName}`,
      PRE_PARTO_3D: `${animal} deve parir em até 3 dias — Fazenda ${params.farmName}`,
      DPP: `${animal} tem parto previsto para hoje — Fazenda ${params.farmName}`,
      POS_DPP_SEM_REGISTRO: `O parto de ${animal} ainda não foi registrado — Fazenda ${params.farmName}`,
    }

    return {
      title: titles[params.tipo] ?? 'CriaViva',
      body: bodies[params.tipo] ?? animal,
      tag: params.tipo,
    }
  }
}
