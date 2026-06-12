import { Module } from '@nestjs/common'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { AlertsModule } from '../alerts/alerts.module'
import { InseminationHandler } from './handlers/insemination.handler'
import { DiagnosisHandler } from './handlers/diagnosis.handler'
import { BirthHandler } from './handlers/birth.handler'
import { EstrusHandler } from './handlers/estrus.handler'
import { CullingHandler } from './handlers/culling.handler'
import { WeaningHandler } from './handlers/weaning.handler'
import { EventHandlerRegistry } from './handlers/event-handler.registry'

@Module({
  imports: [AlertsModule],
  controllers: [EventsController],
  providers: [
    InseminationHandler,
    DiagnosisHandler,
    BirthHandler,
    EstrusHandler,
    CullingHandler,
    WeaningHandler,
    EventHandlerRegistry,
    EventsService,
  ],
})
export class EventsModule {}
