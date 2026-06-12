import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { AnimaisService } from './animais.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('animais')
@UseGuards(JwtAuthGuard)
export class AnimalDiretoController {
  constructor(private animaisService: AnimaisService) {}

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.animaisService.findById(id, user.id)
  }
}
