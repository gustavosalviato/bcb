import { ClientRepository, } from "../../repositories/client-repository";

import { ClientNotFoundError } from "../../errors/client-not-found-error";
import { UnauthorizedError } from "../../errors/unauthorized-error";

interface AuthenticateClientUseCaseRequest {
  documentId: string;
}


interface AuthenticateClientUseCaseResponse {
  clientId: string;
  name: string;
  planType: "prepaid" | "postpaid";
  documentId: string;
}

export class AuthenticateClientUseCase {
  constructor(private clientRepository: ClientRepository) { }

  async execute({ documentId }: AuthenticateClientUseCaseRequest): Promise<AuthenticateClientUseCaseResponse> {
    const client = await this.clientRepository.findByDocumentId(documentId);

    if (!client) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!client.active) {
      throw new UnauthorizedError("Invalid credentials");
    }


    return {
      clientId: client.id,
      name: client.name,
      planType: client.planType,
      documentId: client.documentId,
    }

  }
}