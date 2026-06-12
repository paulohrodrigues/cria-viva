import { Injectable, ForbiddenException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

const WRITE_ROLES: UserRole[] = ['ADMIN', 'EDITOR']

/**
 * Multi-tenant authorization: every record belongs to a farm and the user
 * can only access it if there is a membership in farm_members.
 */
@Injectable()
export class FarmAccessService {
  constructor(private prisma: PrismaService) {}

  /** Requires any membership in the farm (read access). */
  async assertMember(farmId: string, userId: string): Promise<UserRole> {
    const member = await this.prisma.farmMember.findUnique({
      where: { userId_farmId: { userId, farmId } },
    })
    if (!member) throw new ForbiddenException('Acesso negado a esta fazenda')
    return member.role
  }

  /** Requires a role with write permission (ADMIN or EDITOR). */
  async assertEditor(farmId: string, userId: string): Promise<UserRole> {
    const role = await this.assertMember(farmId, userId)
    if (!WRITE_ROLES.includes(role)) {
      throw new ForbiddenException('Seu papel nesta fazenda não permite alterações')
    }
    return role
  }
}
