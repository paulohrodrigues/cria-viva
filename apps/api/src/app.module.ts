import { existsSync } from 'fs'
import { join } from 'path'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bullmq'
import { ThrottlerModule } from '@nestjs/throttler'
import { ServeStaticModule } from '@nestjs/serve-static'
import { PrismaModule } from './shared/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { FazendasModule } from './modules/fazendas/fazendas.module'
import { AnimaisModule } from './modules/animais/animais.module'
import { EventosModule } from './modules/eventos/eventos.module'
import { AlertasModule } from './modules/alertas/alertas.module'
import { RelatoriosModule } from './modules/relatorios/relatorios.module'
import { PushModule } from './modules/push/push.module'

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
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'registro', ttl: 86_400_000, limit: 5 },
    ]),
    PrismaModule,
    AuthModule,
    FazendasModule,
    AnimaisModule,
    EventosModule,
    AlertasModule,
    RelatoriosModule,
    PushModule,
  ],
})
export class AppModule {}
