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

  private checkDatabase(): Promise<DependencyStatus> {
    return this.probe(this.prisma.$queryRaw`SELECT 1`)
  }

  private checkRedis(): Promise<DependencyStatus> {
    // Any Redis round-trip works as a liveness probe
    return this.probe(this.alertsQueue.getJobCounts('waiting'))
  }

  // A broken dependency must report 'down', never hang the request —
  // ioredis, for instance, buffers commands forever while reconnecting
  private async probe(check: Promise<unknown>, timeoutMs = 2500): Promise<DependencyStatus> {
    let timer: NodeJS.Timeout
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('health probe timeout')), timeoutMs)
    })
    try {
      await Promise.race([check, timeout])
      return 'up'
    } catch {
      return 'down'
    } finally {
      clearTimeout(timer!)
    }
  }
}
