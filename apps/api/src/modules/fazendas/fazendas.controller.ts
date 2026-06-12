import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { FazendasService } from './fazendas.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { CreateFazendaDto } from './dto/criar-fazenda.dto'

@Controller('fazendas')
@UseGuards(JwtAuthGuard)
export class FazendasController {
  constructor(private fazendasService: FazendasService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.fazendasService.list(user.id)
  }

  @Post()
  create(
    @Body() dto: CreateFazendaDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.fazendasService.create(dto, user.id)
  }

  @Get(':id/dashboard')
  dashboard(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.fazendasService.dashboard(id, user.id)
  }
}
