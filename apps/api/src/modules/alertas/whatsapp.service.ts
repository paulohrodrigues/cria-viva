import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name)
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(private config: ConfigService) {
    this.baseUrl = config.get('WHATSAPP_API_URL') ?? ''
    this.apiKey = config.get('WHATSAPP_API_KEY') ?? ''
  }

  async sendMessage(phone: string, message: string): Promise<void> {
    if (!this.baseUrl || !this.apiKey) {
      this.logger.warn(`[MOCK] WhatsApp para ${phone}: ${message.slice(0, 80)}...`)
      return
    }

    const digits = phone.replace(/\D/g, '')
    const fullNumber = digits.startsWith('55') ? digits : `55${digits}`

    await axios.post(
      `${this.baseUrl}/message/sendText/cria-viva`,
      {
        number: fullNumber,
        text: message,
      },
      {
        headers: { apikey: this.apiKey },
      },
    )
  }
}
