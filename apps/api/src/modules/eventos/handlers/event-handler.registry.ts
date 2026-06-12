import { Injectable } from '@nestjs/common'
import { TipoEvento } from '@prisma/client'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { InseminationHandler } from './insemination.handler'
import { DiagnosisHandler } from './diagnosis.handler'
import { BirthHandler } from './birth.handler'
import { EstrusHandler } from './estrus.handler'
import { DiscardHandler } from './discard.handler'
import { WeaningHandler } from './weaning.handler'

const noOp: EventHandler = {
  async validate(_context: ValidationContext) {},
  async apply() {},
  async revert() {},
}

@Injectable()
export class EventHandlerRegistry {
  private readonly handlers: Partial<Record<TipoEvento, EventHandler>>

  constructor(
    insemination: InseminationHandler,
    diagnosis: DiagnosisHandler,
    birth: BirthHandler,
    estrus: EstrusHandler,
    discard: DiscardHandler,
    weaning: WeaningHandler,
  ) {
    this.handlers = {
      IA: insemination,
      MONTA: insemination,
      DIAGNOSTICO_GESTACAO: diagnosis,
      PARTO: birth,
      CIO: estrus,
      DESCARTE: discard,
      DESMAME: weaning,
    }
  }

  resolve(tipo: TipoEvento): EventHandler {
    return this.handlers[tipo] ?? noOp
  }
}
