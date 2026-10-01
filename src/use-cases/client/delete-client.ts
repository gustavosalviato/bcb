import { ClientRepository } from '../../repositories/client-repository'

import { ClientNotFoundError } from '../../errors/client-not-found-error'

interface DeleteClientUseCaseRequest {
  clientId: string
}

export class DeleteClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute({ clientId }: DeleteClientUseCaseRequest): Promise<void> {
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      throw new ClientNotFoundError()
    }

    if (client.active) {
      client.active = false

      await this.clientRepository.save(client)
    }
  }
}
