import { createHash, timingSafeEqual } from 'crypto'
import { Controller, Get, Post, UseGuards, Headers, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { CurrentUser } from '../auth/current-user.decorator'
import { AlertasService } from './alertas.service'

@Controller('alertas')
export class AlertasController {
  constructor(
    private prisma: PrismaService,
    private alertasService: AlertasService,
    private config: ConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: { id: string }) {
    const farms = await this.prisma.usuarioFazenda.findMany({
      where: { usuarioId: user.id },
      select: { fazendaId: true },
    })
    const farmIds = farms.map((f) => f.fazendaId)

    return this.prisma.alerta.findMany({
      where: {
        fazendaId: { in: farmIds },
        status: { in: ['PENDENTE', 'ENVIADO'] },
        dataDisparo: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        gestacao: {
          include: { animal: true },
        },
      },
      orderBy: { dataDisparo: 'asc' },
    })
  }

  @Post('processar')
  async processar(@Headers('x-cron-secret') secret: string | undefined) {
    const expected = this.config.get<string>('CRON_SECRET')
    if (!expected || !this.safeCompare(secret ?? '', expected)) {
      throw new UnauthorizedException()
    }
    await this.alertasService.processDailyAlerts()
    return { ok: true }
  }

  // Comparação em tempo constante — hash equaliza os tamanhos dos buffers
  private safeCompare(a: string, b: string): boolean {
    const hashA = createHash('sha256').update(a).digest()
    const hashB = createHash('sha256').update(b).digest()
    return timingSafeEqual(hashA, hashB)
  }
}
