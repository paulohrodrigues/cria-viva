import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Heroku/proxies: required so rate limiting sees the real client IP
  app.set('trust proxy', 1)

  // CSP disabled: the SPA is served by the same process and Vite injects inline scripts
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

  // Ensures clean Prisma/Redis disconnect when Heroku sends SIGTERM
  app.enableShutdownHooks()

  const port = process.env.PORT ?? 3001
  await app.listen(port, '0.0.0.0')
  Logger.log(`CriaViva API listening on port ${port}`, 'Bootstrap')
}

bootstrap()
