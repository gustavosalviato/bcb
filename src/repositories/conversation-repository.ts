import { Prisma, Conversation } from '../../generated/prisma/client'

export interface ConversationRepository {
  create(data: Prisma.ConversationCreateInput): Promise<Conversation>
  findManyByClientId(clientId: string): Promise<Conversation[]>
  findByIdAndClientId(
    id: string,
    clientId: string,
  ): Promise<Conversation | null>
}
