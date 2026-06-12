import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { FarmAccessService } from '../../shared/access/farm-access.service'
import { CreateAnimalDto } from './dto/create-animal.dto'
import { UpdateAnimalDto } from './dto/update-animal.dto'
import { calculateRemainingDays } from '@cria-viva/shared'

@Injectable()
export class AnimalsService {
  constructor(
    private prisma: PrismaService,
    private access: FarmAccessService,
  ) {}

  async list(farmId: string, userId: string) {
    await this.access.assertMember(farmId, userId)

    const animals = await this.prisma.animal.findMany({
      where: { farmId, status: { not: 'DEAD' } },
      include: {
        pregnancies: {
          where: { status: { in: ['SUSPECTED', 'CONFIRMED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { earTag: 'asc' },
    })

    return animals.map((a) => ({
      ...a,
      activePregnancy: a.pregnancies[0]
        ? {
            ...a.pregnancies[0],
            daysRemaining: calculateRemainingDays(a.pregnancies[0].dueDate),
          }
        : null,
    }))
  }

  async findById(id: string, userId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({
      where: { id },
      include: {
        pregnancies: {
          include: { alerts: true },
          orderBy: { createdAt: 'desc' },
        },
        events: {
          orderBy: { eventDate: 'desc' },
          take: 20,
        },
      },
    })

    await this.access.assertMember(animal.farmId, userId)
    return animal
  }

  async create(farmId: string, dto: CreateAnimalDto, userId: string) {
    await this.access.assertEditor(farmId, userId)
    return this.prisma.animal.create({
      data: {
        farmId,
        earTag: dto.earTag,
        name: dto.name,
        breed: dto.breed,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        weightKg: dto.weightKg,
        status: dto.status,
        notes: dto.notes,
      },
    })
  }

  async update(id: string, dto: UpdateAnimalDto, userId: string) {
    const animal = await this.prisma.animal.findUniqueOrThrow({ where: { id } })
    await this.access.assertEditor(animal.farmId, userId)
    return this.prisma.animal.update({
      where: { id },
      data: {
        earTag: dto.earTag,
        name: dto.name,
        breed: dto.breed,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        weightKg: dto.weightKg,
        status: dto.status,
        notes: dto.notes,
      },
    })
  }
}
