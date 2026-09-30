import { PrismaClientRepository } from "../../../repositories/prisma/prisma-client-repository"
import { CreateClientUseCase } from "../create-client"

export function makeCreateClientUseCase() {
  const clientRepository = new PrismaClientRepository()

  return new CreateClientUseCase(clientRepository)
}