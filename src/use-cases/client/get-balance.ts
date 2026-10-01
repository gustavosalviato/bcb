import { ClientRepository } from '../../repositories/client-repository'

import { ClientNotFoundError } from '../../errors/client-not-found-error'

interface GetBalanceUseCaseRequest {
  clientId: string
}

type GetBalanceUseCaseResponse =
  | {
      planType: 'prepaid'
      balance: number
    }
  | {
      planType: 'postpaid'
      monthlyLimit: number
    }

export class GetBalanceUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute({
    clientId,
  }: GetBalanceUseCaseRequest): Promise<GetBalanceUseCaseResponse> {
    const client = await this.clientRepository.findById(clientId)

    if (!client) {
      throw new ClientNotFoundError()
    }

    if (client.planType === 'prepaid') {
      return {
        planType: 'prepaid',
        balance: Number(client.balance),
      }
    }

    return {
      planType: 'postpaid',
      monthlyLimit: Number(client.limit),
    }
  }
}
