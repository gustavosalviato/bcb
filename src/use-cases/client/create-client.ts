import { ClientRepository } from '../../repositories/client-repository'

import { Client } from '../../../generated/prisma/client'
import { ClientAlreadyExistsError } from '../../errors/client-already-exists-error'

interface CreateClientUseCaseRequest {
  name: string
  documentId: string
  documentType: Client['documentType']
  planType: Client['planType']
}

interface CreateClientUseCaseResponse {
  clientId: string
}

export class CreateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute({
    name,
    documentId,
    documentType,
    planType,
  }: CreateClientUseCaseRequest): Promise<CreateClientUseCaseResponse> {
    const existingClient =
      await this.clientRepository.findByDocumentId(documentId)

    if (existingClient) {
      throw new ClientAlreadyExistsError()
    }

    const client = await this.clientRepository.create({
      name,
      documentId,
      documentType,
      planType,
    })

    return {
      clientId: client.id,
    }
  }
}
