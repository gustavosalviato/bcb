import { PrismaClientRepository } from '../../../repositories/prisma/prisma-client-repository'
import { AddCreditUseCase } from '../add-credit'

export function makeAddCreditUseCase() {
  const clientRepository = new PrismaClientRepository()

  return new AddCreditUseCase(clientRepository)
}
