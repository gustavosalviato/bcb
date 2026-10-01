import { randomUUID } from 'crypto'
import { ConversationRepository } from '../conversation-repository'
import { Conversation, Prisma } from '../../../generated/prisma/client'

export class InMemoryConversationRepository implements ConversationRepository {
  private items: Conversation[] = []

  async create(data: Prisma.ConversationCreateInput) {
    const conversation: Conversation = {
      id: data.id ?? randomUUID(),
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      clientId: data.client.connect?.id!,
      lastMessageAt: null,
      lastMessageContent: null,
      createdAt: new Date(),
      unreadCount: 0,
    }

    this.items.push(conversation)

    return conversation
  }

  async findByIdAndClientId(id: string, clientId: string) {
    const conversation = this.items.find(
      item => item.id === id && item.clientId === clientId,
    )

    return conversation ?? null
  }

  async findManyByClientId(clientId: string) {
    const conversations = this.items.filter(item => item.clientId === clientId)

    return conversations
  }
}
