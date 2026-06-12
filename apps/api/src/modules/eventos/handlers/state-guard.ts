import { BadRequestException } from '@nestjs/common'
import { ReproductiveState, ValidationContext } from './validation-context'

export function requireState(context: ValidationContext, allowed: ReproductiveState[], message: string) {
  if (!allowed.includes(context.state)) {
    throw new BadRequestException(message)
  }
}

export function requireActivePregnancy(context: ValidationContext, message: string) {
  if (!context.activePregnancy) {
    throw new BadRequestException(message)
  }
}

export function requireNoActivePregnancy(context: ValidationContext, message: string) {
  if (context.activePregnancy) {
    throw new BadRequestException(message)
  }
}
