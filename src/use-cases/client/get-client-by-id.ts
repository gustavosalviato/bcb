import { ClientRepository, } from "../../repositories/client-repository";

import { Client } from "../../../generated/prisma/client";
import { ClientNotFoundError } from "../../errors/client-not-found-error";

interface GetClientByIdUseCaseRequest {
  clientId: string;
}

interface GetClientByIdUseCaseResponse {
  client: {
    id: string;
    name: string;
    documentId: string;
    documentType: Client['documentType'];
    planType: Client['planType'];
    balance: number;
    limit: number;
    active: boolean;

  }
}

export class GetClientByIdUseCase {
  constructor(private clientRepository: ClientRepository) { }

  async execute({ clientId }: GetClientByIdUseCaseRequest): Promise<GetClientByIdUseCaseResponse> {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new ClientNotFoundError();
    }

    return {
      client: {
        ...client,
        balance: Number(client.balance),
        limit: Number(client.limit),
      }
    }
  }
}