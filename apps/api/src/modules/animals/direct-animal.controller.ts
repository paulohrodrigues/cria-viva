import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { AnimalsService } from './animals.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('animals')
@UseGuards(JwtAuthGuard)
export class DirectAnimalController {
  constructor(private animalsService: AnimalsService) {}

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.animalsService.findById(id, user.id)
  }
}
