import { Prisma, Conversation } from '../../../generated/prisma/client'
import { prisma } from '../../libs/prisma';

import { ConversationRepository } from '../conversation-repository';

export class PrismaConversationRepository implements ConversationRepository {
  async create(data: Prisma.ConversationCreateInput): Promise<Conversation> {
    const conversation = await prisma.conversation.create({
      data
    });

    return conversation;
  }

  async findManyByClientId(clientId: string): Promise<Conversation[]> {
    return prisma.conversation.findMany({
      where: { clientId },
      orderBy: [
        { lastMessageAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
    });
  }

  async findByIdAndClientId(conversationId: string, clientId: string): Promise<Conversation | null> {
    return prisma.conversation.findFirst({
      where: { id: conversationId, clientId },
    });
  }
}