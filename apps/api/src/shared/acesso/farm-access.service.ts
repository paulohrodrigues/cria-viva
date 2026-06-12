import { Injectable, ForbiddenException } from '@nestjs/common'
import { PapelUsuario } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

const PAPEIS_ESCRITA: PapelUsuario[] = ['ADMIN', 'EDITOR']

/**
 * Autorização multi-tenant: todo dado pertence a uma fazenda e o usuário
 * só pode acessá-lo se houver vínculo em usuario_fazenda.
 */
@Injectable()
export class FarmAccessService {
  constructor(private prisma: PrismaService) {}

  /** Exige qualquer vínculo com a fazenda (leitura). */
  async assertMember(fazendaId: string, usuarioId: string): Promise<PapelUsuario> {
    const member = await this.prisma.usuarioFazenda.findUnique({
      where: { usuarioId_fazendaId: { usuarioId, fazendaId } },
    })
    if (!member) throw new ForbiddenException('Acesso negado a esta fazenda')
    return member.papel
  }

  /** Exige papel com permissão de escrita (ADMIN ou EDITOR). */
  async assertEditor(fazendaId: string, usuarioId: string): Promise<PapelUsuario> {
    const papel = await this.assertMember(fazendaId, usuarioId)
    if (!PAPEIS_ESCRITA.includes(papel)) {
      throw new ForbiddenException('Seu papel nesta fazenda não permite alterações')
    }
    return papel
  }
}
