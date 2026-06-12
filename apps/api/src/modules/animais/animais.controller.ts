import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { AnimaisService } from './animais.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { CreateAnimalDto } from './dto/criar-animal.dto'

@Controller('fazendas/:fazendaId/animais')
@UseGuards(JwtAuthGuard)
export class AnimaisController {
  constructor(private animaisService: AnimaisService) {}

  @Get()
  list(
    @Param('fazendaId') fazendaId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.animaisService.list(fazendaId, user.id)
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.animaisService.findById(id, user.id)
  }

  @Post()
  create(
    @Param('fazendaId') fazendaId: string,
    @Body() dto: CreateAnimalDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.animaisService.create(fazendaId, dto, user.id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAnimalDto>,
    @CurrentUser() user: { id: string },
  ) {
    return this.animaisService.update(id, dto, user.id)
  }
}
