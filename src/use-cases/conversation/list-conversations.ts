import { ConversationRepository } from "../../repositories/conversation-repository";

interface ListConversationsUseCaseRequest {
  clientId: string;
}

interface ListConversationsUseCaseResponse {
  conversations: {
    id: string;
    recipientId: string;
    clientId: string;
    recipientName: string;
    lastMessageAt: string | null;
    lastMessageContent: string | null;
    unreadCount: number;
    createdAt: string;
  }[];
}

export class ListConversationsUseCase {
  constructor(private conversationRepository: ConversationRepository) { }

  async execute({ clientId }: ListConversationsUseCaseRequest): Promise<ListConversationsUseCaseResponse> {
    const conversations = await this.conversationRepository.findManyByClientId(clientId);

    return {
      conversations: conversations.map(conversation => ({
        id: conversation.id,
        recipientId: conversation.recipientId,
        clientId: conversation.clientId,
        recipientName: conversation.recipientName,
        lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
        lastMessageContent: conversation.lastMessageContent ?? null,
        unreadCount: conversation.unreadCount,
        createdAt: conversation.createdAt.toISOString(),
      })),
    };
  }
}