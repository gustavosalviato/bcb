import { PrismaClientRepository } from '../../../repositories/prisma/prisma-client-repository'
import { DeleteClientUseCase } from '../delete-client'

export function makeDeletelientUseCase() {
  const clientRepository = new PrismaClientRepository()

  return new DeleteClientUseCase(clientRepository)
}
