import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { EventosService } from './eventos.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { CreateEventoDto } from './dto/criar-evento.dto'

@Controller('animais/:animalId/eventos')
@UseGuards(JwtAuthGuard)
export class EventosController {
  constructor(private eventosService: EventosService) {}

  @Get()
  list(
    @Param('animalId') animalId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventosService.listByAnimal(animalId, user.id)
  }

  @Post()
  create(
    @Param('animalId') animalId: string,
    @Body() dto: CreateEventoDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventosService.create(animalId, dto, user.id)
  }

  @Delete(':id')
  remove(
    @Param('animalId') animalId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventosService.delete(animalId, id, user.id)
  }
}
