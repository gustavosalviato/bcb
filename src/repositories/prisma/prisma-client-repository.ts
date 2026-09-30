import { Prisma, Client } from '../../../generated/prisma/client'
import { prisma } from '../../libs/prisma';


import { ClientRepository } from "../client-repository";

export class PrismaClientRepository implements ClientRepository {
  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    const client = await prisma.client.create({
      data
    });

    return client;
  }

  async findByDocumentId(documentId: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: {
        documentId
      }
    });

    return client;
  }

  async findById(id: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: {
        id
      }
    });

    return client;
  }

  async findAll(): Promise<Client[]> {
    const clients = await prisma.client.findMany();

    return clients;
  }

  async update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    const client = await prisma.client.update({
      where: {
        id
      },
      data
    });

    return client;
  }
}