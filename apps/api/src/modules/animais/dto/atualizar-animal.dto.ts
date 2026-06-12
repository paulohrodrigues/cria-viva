import { PartialType } from '@nestjs/swagger'
import { CreateAnimalDto } from './criar-animal.dto'

// PartialType preserva os decorators de validação — Partial<CreateAnimalDto>
// no @Body() viraria Object em runtime e o ValidationPipe pularia tudo.
export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {}
