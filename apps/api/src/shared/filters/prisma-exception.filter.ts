import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

/**
 * Converte erros conhecidos do Prisma em respostas HTTP adequadas,
 * evitando 500 genérico e vazamento de detalhes internos.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name)

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    switch (exception.code) {
      case 'P2025': // registro não encontrado
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Registro não encontrado',
        })
      case 'P2002': // violação de unique constraint
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Já existe um registro com esses dados',
        })
      case 'P2003': // violação de foreign key
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Referência inválida a outro registro',
        })
      default:
        this.logger.error(`Erro Prisma não tratado ${exception.code}: ${exception.message}`)
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro interno',
        })
    }
  }
}
