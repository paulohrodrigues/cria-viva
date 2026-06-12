import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { AlertsService } from './alerts.service'
import { AlertsProcessor } from './alerts.processor'
import { AlertsController } from './alerts.controller'
import { PushModule } from '../push/push.module'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'alerts' }),
    PushModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsProcessor],
  exports: [AlertsService],
})
export class AlertsModule {}
