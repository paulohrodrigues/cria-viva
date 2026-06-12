import { ReproductiveEvent } from '@prisma/client'
import { CreateEventDto } from '../dto/create-event.dto'
import { ValidationContext } from './validation-context'

export interface EventHandler {
  validate(context: ValidationContext): Promise<void>
  apply(animalId: string, eventId: string, dto: CreateEventDto): Promise<void>
  revert(event: ReproductiveEvent): Promise<void>
}
