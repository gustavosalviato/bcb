import type { ConversationRepository } from "../../repositories/conversation-repository";
import type { MessageRepository } from "../../repositories/message-repository";
import { ConversationNotFoundError } from "../../errors/conversation-not-found-error";
import { MessagePriority, MessageStatus } from "../../../generated/prisma/enums";

interface ListConversationMessagesRequest {
  clientId: string;
  conversationId: string;
}

interface ListConversationMessagesResponse {
  messages: {
    id: string;
    conversationId: string;
    content: string;
    priority: MessagePriority;
    status: MessageStatus;
    cost: number;
    createdAt: string;
    sentAt: string | null;
    deliveredAt: string | null;
    readAt: string | null;
    failureReason: string | null;
  }[]
}

export class ListConversationMessagesUseCase {
  constructor(
    private conversationRepository: ConversationRepository,
    private messageRepository: MessageRepository,
  ) { }

  async execute({
    clientId,
    conversationId,
  }: ListConversationMessagesRequest): Promise<ListConversationMessagesResponse> {
    const conversation = await this.conversationRepository.findByIdAndClientId(conversationId, clientId);

    if (!conversation) {
      throw new ConversationNotFoundError();
    }

    const messages = await this.messageRepository.findManyByConversationId(conversationId);

    return {
      messages: messages.map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        priority: message.priority,
        status: message.status,
        cost: Number(message.cost),
        createdAt: message.createdAt.toISOString(),
        sentAt: message.sentAt?.toISOString() ?? null,
        deliveredAt: message.deliveredAt?.toISOString() ?? null,
        readAt: message.readAt?.toISOString() ?? null,
        failureReason: message.failureReason,
      })),
    };
  }
}