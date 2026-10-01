import { randomUUID } from 'node:crypto'
import { Client, Prisma } from '../../../generated/prisma/client'
import { ClientRepository } from '../client-repository'

export class InMemoryClientRepository implements ClientRepository {
  private items: Client[] = []

  async create(data: Prisma.ClientCreateInput) {
    const client: Client = {
      id: data.id ?? randomUUID(),
      name: data.name,
      documentId: data.documentId,
      documentType: data.documentType,
      planType: data.planType ?? 'prepaid',
      active: data.active ?? true,
      balance: new Prisma.Decimal(Number(data.balance)),
      limit: new Prisma.Decimal(Number(data.limit)),
    }

    this.items.push(client)

    return client
  }

  async findByDocumentId(documentId: string) {
    const client = this.items.find(item => item.documentId === documentId)

    return client ?? null
  }

  async findById(id: string) {
    const client = this.items.find(item => item.id === id)

    return client ?? null
  }

  async findAll() {
    return this.items
  }

  async save(client: Client) {
    const clientIndex = this.items.findIndex(item => item.id === client.id)

    if (clientIndex >= 0) {
      this.items[clientIndex] = client
    }

    return client
  }
}

export const inMemoryClientRepository = new InMemoryClientRepository()
