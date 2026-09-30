import type { FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../errors/unauthorized-error";
import { PrismaClientRepository } from "../../repositories/prisma/prisma-client-repository";

export async function authenticateClient(request: FastifyRequest) {
  const documentId = request.headers["x-client-document-id"];

  if (!documentId || typeof documentId !== 'string') {
    throw new UnauthorizedError();
  }

  const clientRepository = new PrismaClientRepository();

  const client = await clientRepository.findByDocumentId(documentId)

  if (!client) {
    throw new UnauthorizedError();
  }

  if (!client.active) {
    throw new UnauthorizedError();
  }

  request.client = client;
}