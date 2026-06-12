import { Injectable } from '@nestjs/common'
import { ReproductiveEvent } from '@prisma/client'
import { CreateEventDto } from '../dto/create-event.dto'
import { EventHandler } from './event.handler'
import { ValidationContext } from './validation-context'
import { requireState } from './state-guard'

@Injectable()
export class EstrusHandler implements EventHandler {
  async validate(context: ValidationContext) {
    requireState(
      context,
      ['OPEN', 'POSTPARTUM'],
      'Cio detectado com cobertura ativa indica retorno ao cio (falha da IA/Monta). Registre um Diagnóstico de Gestação negativo antes de cadastrar novo cio.',
    )
  }

  async apply(_animalId: string, _eventId: string, _dto: CreateEventDto) {}

  async revert(_event: ReproductiveEvent) {}
}
