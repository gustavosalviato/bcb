import { PrismaClientRepository } from '../../../repositories/prisma/prisma-client-repository'
import { GetClientByIdUseCase } from '../get-client-by-id'

export function makeGetClientByIdUseCase() {
  const clientRepository = new PrismaClientRepository()

  return new GetClientByIdUseCase(clientRepository)
}
