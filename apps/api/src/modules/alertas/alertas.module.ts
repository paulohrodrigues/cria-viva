import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { AlertasService } from './alertas.service'
import { AlertasProcessor } from './alertas.processor'
import { AlertasController } from './alertas.controller'
import { PushModule } from '../push/push.module'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'alertas' }),
    PushModule,
  ],
  controllers: [AlertasController],
  providers: [AlertasService, AlertasProcessor],
  exports: [AlertasService],
})
export class AlertasModule {}
