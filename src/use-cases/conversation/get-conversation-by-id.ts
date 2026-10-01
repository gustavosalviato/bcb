import { ConversationNotFoundError } from '../../errors/conversation-not-found-error'
import { ConversationRepository } from '../../repositories/conversation-repository'

interface GetConversationByIdUseCaseRequest {
  clientId: string
  conversationId: string
}

interface GetConversationByIdUseCaseResponse {
  conversation: {
    id: string
    recipientId: string
    clientId: string
    recipientName: string
    lastMessageAt: string | null
    lastMessageContent: string | null
    unreadCount: number
    createdAt: string
  }
}

export class GetConversationByIdUseCase {
  constructor(private conversationRepository: ConversationRepository) {}

  async execute({
    clientId,
    conversationId,
  }: GetConversationByIdUseCaseRequest): Promise<GetConversationByIdUseCaseResponse> {
    const conversation = await this.conversationRepository.findByIdAndClientId(
      conversationId,
      clientId,
    )

    if (!conversation) {
      throw new ConversationNotFoundError()
    }

    return {
      conversation: {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      },
    }
  }
}
