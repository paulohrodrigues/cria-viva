import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Heroku/proxies: necessário para o rate limit enxergar o IP real do cliente
  app.set('trust proxy', 1)

  // CSP desabilitado: o SPA é servido pelo mesmo processo e o Vite injeta inline scripts
  app.use(helmet({ contentSecurityPolicy: false }))

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new PrismaExceptionFilter())

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })

  // Garante desconexão limpa do Prisma/Redis quando o Heroku envia SIGTERM
  app.enableShutdownHooks()

  const port = process.env.PORT ?? 3001
  await app.listen(port, '0.0.0.0')
  Logger.log(`CriaViva API rodando na porta ${port}`, 'Bootstrap')
}

bootstrap()
