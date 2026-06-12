import { Module } from '@nestjs/common'
import { EventosService } from './eventos.service'
import { EventosController } from './eventos.controller'
import { AlertasModule } from '../alertas/alertas.module'
import { InseminationHandler } from './handlers/insemination.handler'
import { DiagnosisHandler } from './handlers/diagnosis.handler'
import { BirthHandler } from './handlers/birth.handler'
import { EstrusHandler } from './handlers/estrus.handler'
import { DiscardHandler } from './handlers/discard.handler'
import { WeaningHandler } from './handlers/weaning.handler'
import { EventHandlerRegistry } from './handlers/event-handler.registry'

@Module({
  imports: [AlertasModule],
  controllers: [EventosController],
  providers: [
    InseminationHandler,
    DiagnosisHandler,
    BirthHandler,
    EstrusHandler,
    DiscardHandler,
    WeaningHandler,
    EventHandlerRegistry,
    EventosService,
  ],
})
export class EventosModule {}
