import { Injectable } from '@nestjs/common'
import { ReproductiveEvent } from '@prisma/client'
import { CreateEventDto } from '../dto/create-event.dto'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'

@Injectable()
export class CullingHandler implements EventHandler {
  async validate(_context: ValidationContext) {}

  async apply(_animalId: string, _eventId: string, _dto: CreateEventDto) {}

  async revert(_event: ReproductiveEvent) {}
}
