import { PartialType } from '@nestjs/swagger'
import { CreateAnimalDto } from './create-animal.dto'

// PartialType keeps the validation decorators — Partial<CreateAnimalDto>
// in @Body() would become Object at runtime and the ValidationPipe would skip everything.
export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {}
