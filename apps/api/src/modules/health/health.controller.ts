import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../../shared/prisma/prisma.service'

type DependencyStatus = 'up' | 'down'

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('alerts') private alertsQueue: Queue,
  ) {}

  // Public on purpose: used by uptime monitors and the Heroku router
  @Get()
  async check() {
    const [db, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()])

    const body = {
      status: db === 'up' && redis === 'up' ? 'ok' : 'degraded',
      db,
      redis,
      uptimeSeconds: Math.floor(process.uptime()),
    }

    if (body.status !== 'ok') throw new ServiceUnavailableException(body)
    return body
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return 'up'
    } catch {
      return 'down'
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    try {
      // Any Redis round-trip works as a liveness probe
      await this.alertsQueue.getJobCounts('waiting')
      return 'up'
    } catch {
      return 'down'
    }
  }
}
