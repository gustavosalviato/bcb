import { ClientRepository } from '../../repositories/client-repository'

import { ClientNotFoundError } from '../../errors/client-not-found-error'

interface UpdateClientUseCaseRequest {
  clientId: string
  name?: string
}

export class UpdateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute({ clientId, name }: UpdateClientUseCaseRequest): Promise<void> {
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      throw new ClientNotFoundError()
    }

    await this.clientRepository.update(clientId, {
      name: name ?? client.name,
    })
  }
}
