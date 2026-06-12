import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../shared/prisma/prisma.service'
import * as webpush from 'web-push'

export interface PushPayload {
  title: string
  body: string
  tag?: string
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name)

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY')
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY')
    const email = this.config.get<string>('VAPID_EMAIL') ?? 'mailto:admin@criaviva.app'

    if (!publicKey || !privateKey) {
      this.logger.warn('VAPID keys not configured — push notifications disabled')
      return
    }

    webpush.setVapidDetails(email, publicKey, privateKey)
    this.logger.log('Web Push configured')
  }

  async subscribe(usuarioId: string, endpoint: string, p256dh: string, auth: string) {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, usuarioId },
      create: { usuarioId, endpoint, p256dh, auth },
    })
  }

  async unsubscribe(usuarioId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { usuarioId, endpoint },
    })
  }

  async sendToUser(usuarioId: string, payload: PushPayload) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { usuarioId },
    })
    if (subscriptions.length === 0) return { sent: 0 }

    const { sent } = await this.dispatch(subscriptions, payload)
    return { sent }
  }

  async sendToFarm(fazendaId: string, payload: PushPayload) {
    const members = await this.prisma.usuarioFazenda.findMany({
      where: { fazendaId },
      select: { usuarioId: true },
    })
    const userIds = members.map((m) => m.usuarioId)

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { usuarioId: { in: userIds } },
    })

    if (subscriptions.length === 0) {
      this.logger.log(`No push subscriptions for farm ${fazendaId}`)
      return
    }

    const { failed } = await this.dispatch(subscriptions, payload)
    if (failed > 0) {
      this.logger.warn(`${failed}/${subscriptions.length} push notifications failed`)
    }
  }

  private async dispatch(
    subscriptions: Array<{ endpoint: string; p256dh: string; auth: string }>,
    payload: PushPayload,
  ) {
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        ),
      ),
    )

    // 404/410: endpoint expirado ou cancelado; 403: subscription criada com
    // outra chave VAPID (rotação de chave) — nos três casos nunca mais funciona.
    const deadEndpoints = results
      .map((result, i) => {
        if (result.status !== 'rejected') return null
        const statusCode = (result.reason as { statusCode?: number })?.statusCode
        return statusCode && [403, 404, 410].includes(statusCode) ? subscriptions[i].endpoint : null
      })
      .filter((endpoint): endpoint is string => endpoint !== null)

    if (deadEndpoints.length > 0) {
      await this.prisma.pushSubscription.deleteMany({ where: { endpoint: { in: deadEndpoints } } })
      this.logger.log(`Removed ${deadEndpoints.length} dead push subscriptions`)
    }

    const failed = results.filter((r) => r.status === 'rejected').length
    return { sent: subscriptions.length - failed, failed }
  }
}
