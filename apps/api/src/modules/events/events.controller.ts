import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { EventsService } from './events.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { CreateEventDto } from './dto/create-event.dto'

@Controller('animals/:animalId/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  list(
    @Param('animalId') animalId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventsService.listByAnimal(animalId, user.id)
  }

  @Post()
  create(
    @Param('animalId') animalId: string,
    @Body() dto: CreateEventDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventsService.create(animalId, dto, user.id)
  }

  @Delete(':id')
  remove(
    @Param('animalId') animalId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventsService.delete(animalId, id, user.id)
  }
}
