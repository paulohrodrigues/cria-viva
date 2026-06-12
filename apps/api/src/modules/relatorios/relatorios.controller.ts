import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { RelatoriosService } from './relatorios.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('fazendas/:fazendaId/relatorios')
@UseGuards(JwtAuthGuard)
export class RelatoriosController {
  constructor(private relatoriosService: RelatoriosService) {}

  @Get('eficiencia')
  getEfficiency(
    @Param('fazendaId') fazendaId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.relatoriosService.reproductiveEfficiency(fazendaId, user.id)
  }

  @Get('vacas-abertas')
  getOpenCows(
    @Param('fazendaId') fazendaId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.relatoriosService.openCows(fazendaId, user.id)
  }
}
