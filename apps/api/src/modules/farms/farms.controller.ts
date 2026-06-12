import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { FarmsService } from './farms.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { CreateFarmDto } from './dto/create-farm.dto'

@Controller('farms')
@UseGuards(JwtAuthGuard)
export class FarmsController {
  constructor(private farmsService: FarmsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.farmsService.list(user.id)
  }

  @Post()
  create(
    @Body() dto: CreateFarmDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.farmsService.create(dto, user.id)
  }

  @Get(':id/dashboard')
  dashboard(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.farmsService.dashboard(id, user.id)
  }
}
