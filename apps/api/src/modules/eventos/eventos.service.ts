import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common'
import { TipoEvento, Prisma } from '@prisma/client'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { EventHandlerRegistry } from './handlers/event-handler.registry'
import { CreateEventoDto } from './dto/criar-evento.dto'
import { ValidationContext, ReproductiveState } from './handlers/validation-context'

const STATUS_TERMINAL = ['DESCARTADA', 'VENDIDA', 'MORTA'] as const

@Injectable()
export class EventosService {
  constructor(
    private prisma: PrismaService,
    private registry: EventHandlerRegistry,
  ) {}

  async create(animalId: string, dto: CreateEventoDto, usuarioId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id: animalId } })
    await this.checkAccess(animal.fazendaId, usuarioId)

    if (STATUS_TERMINAL.includes(animal.status as any)) {
      throw new BadRequestException(
        `Não é possível registrar eventos em um animal com status "${animal.status}"`,
      )
    }

    const eventDate = new Date(dto.dataEvento)
    await this.validateEventDate(animalId, eventDate)

    const tipo = dto.tipo as TipoEvento
    const context = await this.buildValidationContext(animalId, eventDate)
    await this.registry.resolve(tipo).validate(context)

    const evento = await this.prisma.eventoReprodutivo.create({
      data: {
        animalId,
        usuarioId,
        tipo,
        dataEvento: eventDate,
        resultado: dto.resultado,
        observacoes: dto.observacoes,
        dadosExtras: dto.dadosExtras as Prisma.InputJsonValue | undefined,
      },
    })

    await this.registry.resolve(tipo).apply(animalId, evento.id, dto)
    return evento
  }

  async delete(animalId: string, eventoId: string, usuarioId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id: animalId } })
    await this.checkAccess(animal.fazendaId, usuarioId)

    const evento = await this.prisma.eventoReprodutivo.findFirst({
      where: { id: eventoId, animalId },
    })
    if (!evento) throw new NotFoundException('Evento não encontrado')

    await this.registry.resolve(evento.tipo as TipoEvento).revert(evento)
    await this.prisma.eventoReprodutivo.delete({ where: { id: eventoId } })
    return { ok: true }
  }

  async listByAnimal(animalId: string, usuarioId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id: animalId } })
    await this.checkAccess(animal.fazendaId, usuarioId)

    return this.prisma.eventoReprodutivo.findMany({
      where: { animalId },
      orderBy: { dataEvento: 'desc' },
    })
  }

  private async buildValidationContext(animalId: string, eventDate: Date): Promise<ValidationContext> {
    const [activePregnancy, lastEvent] = await Promise.all([
      this.prisma.gestacao.findFirst({
        where: { animalId, status: { in: ['SUSPEITA', 'CONFIRMADA'] } },
        orderBy: { dataCobertura: 'desc' },
        select: { id: true, dataCobertura: true, status: true },
      }),
      this.prisma.eventoReprodutivo.findFirst({
        where: { animalId },
        orderBy: { dataEvento: 'desc' },
        select: { tipo: true, dataEvento: true },
      }),
    ])

    let state: ReproductiveState
    if (activePregnancy) {
      state = 'PREGNANT'
    } else if (lastEvent?.tipo === 'PARTO') {
      state = 'POSTPARTUM'
    } else {
      state = 'OPEN'
    }

    return { state, activePregnancy, lastEvent, eventDate }
  }

  private async validateEventDate(animalId: string, eventDate: Date) {
    const lastEvent = await this.prisma.eventoReprodutivo.findFirst({
      where: { animalId },
      orderBy: { dataEvento: 'desc' },
    })
    if (!lastEvent) return

    const newDate = new Date(eventDate)
    newDate.setHours(0, 0, 0, 0)
    const lastDate = new Date(lastEvent.dataEvento)
    lastDate.setHours(0, 0, 0, 0)

    if (newDate < lastDate) {
      const fmt = (d: Date) => d.toLocaleDateString('pt-BR')
      throw new BadRequestException(
        `Data inválida: ${fmt(newDate)} é anterior ao último evento registrado (${fmt(lastDate)}). Corrija a data ou apague o evento mais recente primeiro.`,
      )
    }
  }

  private async checkAccess(fazendaId: string, usuarioId: string) {
    const member = await this.prisma.usuarioFazenda.findUnique({
      where: { usuarioId_fazendaId: { usuarioId, fazendaId } },
    })
    if (!member) throw new ForbiddenException('Acesso negado')
  }
}
