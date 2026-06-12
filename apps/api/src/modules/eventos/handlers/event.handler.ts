import { EventoReprodutivo } from '@prisma/client'
import { CreateEventoDto } from '../dto/criar-evento.dto'
import { ValidationContext } from './validation-context'

export interface EventHandler {
  validate(context: ValidationContext): Promise<void>
  apply(animalId: string, eventId: string, dto: CreateEventoDto): Promise<void>
  revert(event: EventoReprodutivo): Promise<void>
}
