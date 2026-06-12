import { existsSync } from 'fs'
import { join } from 'path'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bullmq'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ServeStaticModule } from '@nestjs/serve-static'
import { PrismaModule } from './shared/prisma/prisma.module'
import { FarmAccessModule } from './shared/access/farm-access.module'
import { AuthModule } from './modules/auth/auth.module'
import { FarmsModule } from './modules/farms/farms.module'
import { AnimalsModule } from './modules/animals/animals.module'
import { EventsModule } from './modules/events/events.module'
import { AlertsModule } from './modules/alerts/alerts.module'
import { ReportsModule } from './modules/reports/reports.module'
import { PushModule } from './modules/push/push.module'
import { HealthModule } from './modules/health/health.module'

const webDistPath = join(__dirname, '..', '..', '..', 'apps', 'web', 'dist')

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ...(existsSync(webDistPath)
      ? [ServeStaticModule.forRoot({ rootPath: webDistPath, exclude: ['/api/(.*)'] })]
      : []),
    BullModule.forRoot({
      connection: (() => {
        const url = process.env.REDIS_URL
        if (url) {
          const u = new URL(url)
          return {
            host: u.hostname,
            port: Number(u.port) || 6379,
            ...(u.password && { password: u.password }),
            ...(url.startsWith('rediss://') && { tls: {} }),
          }
        }
        return {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        }
      })(),
    }),
    // Global limit; sensitive routes (login/register) have overrides via @Throttle
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    FarmAccessModule,
    AuthModule,
    FarmsModule,
    AnimalsModule,
    EventsModule,
    AlertsModule,
    ReportsModule,
    PushModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
