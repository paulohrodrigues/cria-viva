import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { FarmAccessService } from '../../shared/access/farm-access.service'

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private access: FarmAccessService,
  ) {}

  async reproductiveEfficiency(farmId: string, userId: string) {
    await this.access.assertMember(farmId, userId)

    const [totalBreedings, pregnancies, positiveDiagnoses, calvings, openCowCount] = await Promise.all([
      this.prisma.reproductiveEvent.count({
        where: { animal: { farmId }, type: { in: ['INSEMINATION', 'NATURAL_BREEDING'] } },
      }),
      this.prisma.pregnancy.count({
        where: {
          animal: { farmId },
          status: { in: ['SUSPECTED', 'CONFIRMED', 'COMPLETED'] },
        },
      }),
      this.prisma.reproductiveEvent.count({
        where: { animal: { farmId }, type: 'PREGNANCY_DIAGNOSIS', result: true },
      }),
      this.prisma.pregnancy.count({
        where: { animal: { farmId }, status: 'COMPLETED' },
      }),
      this.prisma.animal.count({
        where: {
          farmId,
          status: 'ACTIVE',
          pregnancies: { none: { status: { in: ['SUSPECTED', 'CONFIRMED'] } } },
        },
      }),
    ])

    const conceptionRate = totalBreedings > 0 ? Math.round((pregnancies / totalBreedings) * 100) : 0

    return {
      totalBreedings,
      positiveDiagnoses,
      conceptionRate,
      totalCalvings: calvings,
      openCows: openCowCount,
    }
  }

  async openCows(farmId: string, userId: string) {
    await this.access.assertMember(farmId, userId)

    const animals = await this.prisma.animal.findMany({
      where: {
        farmId,
        status: 'ACTIVE',
        pregnancies: { none: { status: { in: ['SUSPECTED', 'CONFIRMED'] } } },
      },
      include: {
        events: {
          where: { type: { in: ['INSEMINATION', 'NATURAL_BREEDING', 'CALVING'] } },
          orderBy: { eventDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { earTag: 'asc' },
    })

    return animals.map((a) => ({
      id: a.id,
      earTag: a.earTag,
      name: a.name,
      lastEvent: a.events[0]?.eventDate ?? null,
      daysOpen: a.events[0]
        ? Math.floor((Date.now() - new Date(a.events[0].eventDate).getTime()) / 86400000)
        : null,
    }))
  }
}
