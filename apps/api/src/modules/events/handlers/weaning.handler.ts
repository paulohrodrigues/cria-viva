import { Injectable } from '@nestjs/common'
import { ReproductiveEvent } from '@prisma/client'
import { CreateEventDto } from '../dto/create-event.dto'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireState } from './state-guard'

@Injectable()
export class WeaningHandler implements EventHandler {
  async validate(context: ValidationContext) {
    requireState(context, ['POSTPARTUM'], 'Desmame só pode ser registrado após um parto.')
  }

  async apply(_animalId: string, _eventId: string, _dto: CreateEventDto) {}

  async revert(_event: ReproductiveEvent) {}
}
