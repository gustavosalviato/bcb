import { PrismaClientRepository } from '../../../repositories/prisma/prisma-client-repository'
import { ListClientsUseCase } from '../list-clients'

export function makeListClientsUseCase() {
  const clientRepository = new PrismaClientRepository()

  return new ListClientsUseCase(clientRepository)
}
