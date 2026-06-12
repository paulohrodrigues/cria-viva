import { createHash, timingSafeEqual } from 'crypto'
import { Controller, Get, Post, UseGuards, Headers, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { CurrentUser } from '../auth/current-user.decorator'
import { AlertsService } from './alerts.service'

@Controller('alerts')
export class AlertsController {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
    private config: ConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: { id: string }) {
    const farms = await this.prisma.farmMember.findMany({
      where: { userId: user.id },
      select: { farmId: true },
    })
    const farmIds = farms.map((f) => f.farmId)

    return this.prisma.alert.findMany({
      where: {
        farmId: { in: farmIds },
        status: { in: ['PENDING', 'SENT'] },
        scheduledFor: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        pregnancy: {
          include: { animal: true },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    })
  }

  @Post('process')
  async process(@Headers('x-cron-secret') secret: string | undefined) {
    const expected = this.config.get<string>('CRON_SECRET')
    if (!expected || !this.safeCompare(secret ?? '', expected)) {
      throw new UnauthorizedException()
    }
    await this.alertsService.processDailyAlerts()
    return { ok: true }
  }

  // Constant-time comparison — hashing equalizes buffer lengths
  private safeCompare(a: string, b: string): boolean {
    const hashA = createHash('sha256').update(a).digest()
    const hashB = createHash('sha256').update(b).digest()
    return timingSafeEqual(hashA, hashB)
  }
}
