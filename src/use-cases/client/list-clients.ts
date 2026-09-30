import { ClientRepository, } from "../../repositories/client-repository"; 1
import { Client } from "../../../generated/prisma/client";
interface ListClientsUseCaseResponse {
  clients: {
    id: string;
    name: string;
    documentId: string;
    documentType: Client['documentType'];
    planType: Client['planType'];
    balance: number;
    limit: number;
    active: boolean;
  }[]
}

export class ListClientsUseCase {
  constructor(private clientRepository: ClientRepository) { }

  async execute(): Promise<ListClientsUseCaseResponse> {

    const clients = await this.clientRepository.findAll();

    return {
      clients: clients.map((client) => {
        return {
          ...client,
          balance: Number(client.balance),
          limit: Number(client.limit),
        }
      })
    }
  }
}