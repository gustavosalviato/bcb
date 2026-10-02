import { PrismaMessageRepository } from '../../../repositories/prisma/prisma-message-repository'
import { GetMessageUseCase } from '../get-message'

export function makeGetMessageUseCase() {
  return new GetMessageUseCase(new PrismaMessageRepository())
}
