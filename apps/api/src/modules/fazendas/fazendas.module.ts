import { Module } from '@nestjs/common'
import { FazendasService } from './fazendas.service'
import { FazendasController } from './fazendas.controller'

@Module({
  controllers: [FazendasController],
  providers: [FazendasService],
  exports: [FazendasService],
})
export class FazendasModule {}
