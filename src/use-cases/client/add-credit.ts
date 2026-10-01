import { ClientRepository } from '../../repositories/client-repository'

import { ClientNotFoundError } from '../../errors/client-not-found-error'

interface AddCreditUseCaseRequest {
  clientId: string
  amount: number
}

export class AddCreditUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute({ clientId, amount }: AddCreditUseCaseRequest): Promise<void> {
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      throw new ClientNotFoundError()
    }

    await this.clientRepository.save({
      ...client,
      balance:
        client.planType === 'prepaid'
          ? client.balance.add(amount)
          : client.limit.add(amount),
    })
  }
}
