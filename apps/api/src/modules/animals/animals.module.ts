import { Module } from '@nestjs/common'
import { AnimalsService } from './animals.service'
import { AnimalsController } from './animals.controller'
import { DirectAnimalController } from './direct-animal.controller'

@Module({
  controllers: [AnimalsController, DirectAnimalController],
  providers: [AnimalsService],
  exports: [AnimalsService],
})
export class AnimalsModule {}
