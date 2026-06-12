import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { AnimalsService } from './animals.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { CreateAnimalDto } from './dto/create-animal.dto'
import { UpdateAnimalDto } from './dto/update-animal.dto'

@Controller('farms/:farmId/animals')
@UseGuards(JwtAuthGuard)
export class AnimalsController {
  constructor(private animalsService: AnimalsService) {}

  @Get()
  list(
    @Param('farmId') farmId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.animalsService.list(farmId, user.id)
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.animalsService.findById(id, user.id)
  }

  @Post()
  create(
    @Param('farmId') farmId: string,
    @Body() dto: CreateAnimalDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.animalsService.create(farmId, dto, user.id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAnimalDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.animalsService.update(id, dto, user.id)
  }
}
