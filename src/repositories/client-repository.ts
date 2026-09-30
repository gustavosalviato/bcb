import { Prisma, Client } from '../../generated/prisma/client'

export interface ClientRepository {
  create(data: Prisma.ClientCreateInput): Promise<Client>
  findByDocumentId(documentId: string): Promise<Client | null>
  findById(id: string): Promise<Client | null>
  findAll(): Promise<Client[]>
  update(id: string, data: Prisma.ClientUpdateInput): Promise<Client>
}