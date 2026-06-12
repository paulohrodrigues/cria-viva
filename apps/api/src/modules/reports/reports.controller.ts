import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('farms/:farmId/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('efficiency')
  getEfficiency(
    @Param('farmId') farmId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.reproductiveEfficiency(farmId, user.id)
  }

  @Get('open-cows')
  getOpenCows(
    @Param('farmId') farmId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.openCows(farmId, user.id)
  }
}
