import { Injectable } from '@nestjs/common'
import { EventType } from '@prisma/client'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { InseminationHandler } from './insemination.handler'
import { DiagnosisHandler } from './diagnosis.handler'
import { BirthHandler } from './birth.handler'
import { EstrusHandler } from './estrus.handler'
import { CullingHandler } from './culling.handler'
import { WeaningHandler } from './weaning.handler'

const noOp: EventHandler = {
  async validate(_context: ValidationContext) {},
  async apply() {},
  async revert() {},
}

@Injectable()
export class EventHandlerRegistry {
  private readonly handlers: Partial<Record<EventType, EventHandler>>

  constructor(
    insemination: InseminationHandler,
    diagnosis: DiagnosisHandler,
    birth: BirthHandler,
    estrus: EstrusHandler,
    culling: CullingHandler,
    weaning: WeaningHandler,
  ) {
    this.handlers = {
      INSEMINATION: insemination,
      NATURAL_BREEDING: insemination,
      PREGNANCY_DIAGNOSIS: diagnosis,
      CALVING: birth,
      HEAT: estrus,
      CULLING: culling,
      WEANING: weaning,
    }
  }

  resolve(type: EventType): EventHandler {
    return this.handlers[type] ?? noOp
  }
}
