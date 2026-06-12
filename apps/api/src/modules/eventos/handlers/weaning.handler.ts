import { Injectable } from '@nestjs/common'
import { EventoReprodutivo } from '@prisma/client'
import { CreateEventoDto } from '../dto/criar-evento.dto'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireState } from './state-guard'

@Injectable()
export class WeaningHandler implements EventHandler {
  async validate(context: ValidationContext) {
    requireState(context, ['POSTPARTUM'], 'Desmame só pode ser registrado após um parto.')
  }

  async apply(_animalId: string, _eventId: string, _dto: CreateEventoDto) {}

  async revert(_event: EventoReprodutivo) {}
}
