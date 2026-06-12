import { Module } from '@nestjs/common'
import { AnimaisService } from './animais.service'
import { AnimaisController } from './animais.controller'
import { AnimalDiretoController } from './animal-direto.controller'

@Module({
  controllers: [AnimaisController, AnimalDiretoController],
  providers: [AnimaisService],
  exports: [AnimaisService],
})
export class AnimaisModule {}
