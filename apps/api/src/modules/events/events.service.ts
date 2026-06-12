import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { AnimalStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { FarmAccessService } from '../../shared/access/farm-access.service'
import { EventHandlerRegistry } from './handlers/event-handler.registry'
import { CreateEventDto } from './dto/create-event.dto'
import { ValidationContext, ReproductiveState } from './handlers/validation-context'

const TERMINAL_STATUSES: AnimalStatus[] = ['CULLED', 'SOLD', 'DEAD']

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private access: FarmAccessService,
    private registry: EventHandlerRegistry,
  ) {}

  async create(animalId: string, dto: CreateEventDto, userId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id: animalId } })
    await this.access.assertEditor(animal.farmId, userId)

    if (TERMINAL_STATUSES.includes(animal.status)) {
      throw new BadRequestException(
        `Não é possível registrar eventos em um animal com status "${animal.status}"`,
      )
    }

    const eventDate = new Date(dto.eventDate)
    const context = await this.buildValidationContext(animalId, eventDate)
    this.validateEventDate(context)
    await this.registry.resolve(dto.type).validate(context)

    const event = await this.prisma.reproductiveEvent.create({
      data: {
        animalId,
        userId,
        type: dto.type,
        eventDate,
        result: dto.result,
        notes: dto.notes,
        extraData: dto.extraData as Prisma.InputJsonValue | undefined,
      },
    })

    // Compensation: if the side effect fails (e.g. creating a pregnancy),
    // remove the event so the history is not left inconsistent
    try {
      await this.registry.resolve(dto.type).apply(animalId, event.id, dto)
    } catch (err) {
      await this.prisma.reproductiveEvent
        .delete({ where: { id: event.id } })
        .catch(() => undefined)
      throw err
    }

    return event
  }

  async delete(animalId: string, eventId: string, userId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id: animalId } })
    await this.access.assertEditor(animal.farmId, userId)

    const event = await this.prisma.reproductiveEvent.findFirst({
      where: { id: eventId, animalId },
    })
    if (!event) throw new NotFoundException('Evento não encontrado')

    await this.registry.resolve(event.type).revert(event)
    await this.prisma.reproductiveEvent.delete({ where: { id: eventId } })
    return { ok: true }
  }

  async listByAnimal(animalId: string, userId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id: animalId } })
    await this.access.assertMember(animal.farmId, userId)

    return this.prisma.reproductiveEvent.findMany({
      where: { animalId },
      orderBy: { eventDate: 'desc' },
    })
  }

  private async buildValidationContext(animalId: string, eventDate: Date): Promise<ValidationContext> {
    const [activePregnancy, lastEvent] = await Promise.all([
      this.prisma.pregnancy.findFirst({
        where: { animalId, status: { in: ['SUSPECTED', 'CONFIRMED'] } },
        orderBy: { breedingDate: 'desc' },
        select: { id: true, breedingDate: true, status: true },
      }),
      this.prisma.reproductiveEvent.findFirst({
        where: { animalId },
        orderBy: { eventDate: 'desc' },
        select: { type: true, eventDate: true },
      }),
    ])

    let state: ReproductiveState
    if (activePregnancy) {
      state = 'PREGNANT'
    } else if (lastEvent?.type === 'CALVING') {
      state = 'POSTPARTUM'
    } else {
      state = 'OPEN'
    }

    return { state, activePregnancy, lastEvent, eventDate }
  }

  private validateEventDate(context: ValidationContext) {
    if (!context.lastEvent) return

    const newDate = new Date(context.eventDate)
    newDate.setHours(0, 0, 0, 0)
    const lastDate = new Date(context.lastEvent.eventDate)
    lastDate.setHours(0, 0, 0, 0)

    if (newDate < lastDate) {
      const fmt = (d: Date) => d.toLocaleDateString('pt-BR')
      throw new BadRequestException(
        `Data inválida: ${fmt(newDate)} é anterior ao último evento registrado (${fmt(lastDate)}). Corrija a data ou apague o evento mais recente primeiro.`,
      )
    }
  }
}
