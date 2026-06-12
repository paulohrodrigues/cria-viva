import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { FarmAccessService } from '../../shared/access/farm-access.service'
import { CreateFarmDto } from './dto/create-farm.dto'
import { calculateRemainingDays, classifyAlertUrgency } from '@cria-viva/shared'

@Injectable()
export class FarmsService {
  constructor(
    private prisma: PrismaService,
    private access: FarmAccessService,
  ) {}

  async list(userId: string) {
    const members = await this.prisma.farmMember.findMany({
      where: { userId },
      include: { farm: true },
    })
    return members.map((m) => ({ ...m.farm, role: m.role }))
  }

  async create(dto: CreateFarmDto, userId: string) {
    // Transaction: a farm without an ADMIN membership would be orphaned and inaccessible
    return this.prisma.$transaction(async (tx) => {
      const farm = await tx.farm.create({
        data: {
          name: dto.name,
          city: dto.city,
          state: dto.state,
          type: dto.type ?? 'BEEF',
        },
      })
      await tx.farmMember.create({
        data: { userId, farmId: farm.id, role: 'ADMIN' },
      })
      return farm
    })
  }

  async dashboard(farmId: string, userId: string) {
    await this.access.assertMember(farmId, userId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in7Days = new Date(today)
    in7Days.setDate(in7Days.getDate() + 7)
    const in30Days = new Date(today)
    in30Days.setDate(in30Days.getDate() + 30)

    const [totalActive, pregnancies, totalOpen] = await Promise.all([
      this.prisma.animal.count({
        where: { farmId, status: { in: ['ACTIVE', 'DRY'] } },
      }),
      this.prisma.pregnancy.findMany({
        where: {
          status: { in: ['SUSPECTED', 'CONFIRMED'] },
          animal: { farmId },
        },
        include: { animal: true },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.animal.count({
        where: {
          farmId,
          status: 'ACTIVE',
          pregnancies: { none: { status: { in: ['SUSPECTED', 'CONFIRMED'] } } },
        },
      }),
    ])

    const birthsThisWeek = pregnancies.filter(
      (p) => p.dueDate >= today && p.dueDate <= in7Days,
    )
    const birthsThisMonth = pregnancies.filter(
      (p) => p.dueDate >= today && p.dueDate <= in30Days,
    )

    const upcomingBirths = pregnancies.slice(0, 10).map((p) => {
      const daysRemaining = calculateRemainingDays(p.dueDate)
      return {
        animalId: p.animalId,
        earTag: p.animal.earTag,
        animalName: p.animal.name ?? undefined,
        dueDate: p.dueDate.toISOString(),
        daysRemaining,
        urgency: classifyAlertUrgency(daysRemaining),
        status: p.status,
      }
    })

    return {
      totalActive,
      totalPregnant: pregnancies.length,
      birthsThisWeek: birthsThisWeek.length,
      birthsThisMonth: birthsThisMonth.length,
      totalOpen,
      upcomingBirths,
    }
  }
}
