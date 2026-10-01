import { PrismaClientRepository } from '../../../repositories/prisma/prisma-client-repository'
import { GetBalanceUseCase } from '../get-balance'

export function makeGetBalanceUseCase() {
  const clientRepository = new PrismaClientRepository()

  return new GetBalanceUseCase(clientRepository)
}
