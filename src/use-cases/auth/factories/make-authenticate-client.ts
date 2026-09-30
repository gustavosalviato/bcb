import { PrismaClientRepository } from "../../../repositories/prisma/prisma-client-repository"
import { AuthenticateClientUseCase } from "../authenticate-client"

export function makeAuthenticateClientUseCase() {
  const clientRepository = new PrismaClientRepository()

  return new AuthenticateClientUseCase(clientRepository)
}