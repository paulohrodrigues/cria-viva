import { Injectable } from '@nestjs/common'
import { EventoReprodutivo } from '@prisma/client'
import { CreateEventoDto } from '../dto/criar-evento.dto'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'

@Injectable()
export class DiscardHandler implements EventHandler {
  async validate(_context: ValidationContext) {}

  async apply(_animalId: string, _eventId: string, _dto: CreateEventoDto) {}

  async revert(_event: EventoReprodutivo) {}
}
