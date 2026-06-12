import { Controller, Post, Delete, Body, UseGuards, Get } from '@nestjs/common'
import { IsString, IsObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { PushService } from './push.service'
import { ConfigService } from '@nestjs/config'

class PushKeysDto {
  @IsString() p256dh: string
  @IsString() auth: string
}

class SubscribeDto {
  @IsString() endpoint: string
  @IsObject() @ValidateNested() @Type(() => PushKeysDto) keys: PushKeysDto
}

class UnsubscribeDto {
  @IsString() endpoint: string
}

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(
    private push: PushService,
    private config: ConfigService,
  ) {}

  @Get('vapid-key')
  getVapidKey() {
    return { publicKey: this.config.get<string>('VAPID_PUBLIC_KEY') ?? '' }
  }


  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: { id: string },
    @Body() dto: SubscribeDto,
  ) {
    await this.push.subscribe(user.id, dto.endpoint, dto.keys.p256dh, dto.keys.auth)
    return { ok: true }
  }

  @Delete('subscribe')
  async unsubscribe(
    @CurrentUser() user: { id: string },
    @Body() dto: UnsubscribeDto,
  ) {
    await this.push.unsubscribe(user.id, dto.endpoint)
    return { ok: true }
  }
}
