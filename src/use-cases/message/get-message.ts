import type { MessageRepository } from '../../repositories/message-repository'
import { MessagePriority, MessageStatus } from '../../../generated/prisma/enums'
import { MessageNotFoundError } from '../../errors/message-not-found-error'
import { ConversationRepository } from '../../repositories/conversation-repository'
import { ConversationNotFoundError } from '../../errors/conversation-not-found-error'

interface GetMessageUseCaseRequest {
  clientId: string
  conversationId: string
  messageId: string
}

interface GetMessageUseCaseResponse {
  message: {
    id: string
    conversationId: string
    content: string
    priority: MessagePriority
    status: MessageStatus
    cost: number
    createdAt: string
    sentAt: string | null
    deliveredAt: string | null
    readAt: string | null
    failureReason: string | null
  }
}

export class GetMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private conversationRepository: ConversationRepository,
  ) {}

  async execute({
    clientId,
    messageId,
    conversationId,
  }: GetMessageUseCaseRequest): Promise<GetMessageUseCaseResponse> {
    const conversation = await this.conversationRepository.findByIdAndClientId(
      conversationId,
      clientId,
    )

    if (!conversation) {
      throw new ConversationNotFoundError()
    }

    const response = await this.messageRepository.findById(messageId)

    if (!response) {
      throw new MessageNotFoundError()
    }

    return {
      message: {
        id: response.id,
        conversationId: response.conversationId,
        content: response.content,
        priority: response.priority,
        status: response.status,
        cost: Number(response.cost),
        createdAt: response.createdAt.toISOString(),
        sentAt: response.sentAt?.toISOString() ?? null,
        deliveredAt: response.deliveredAt?.toISOString() ?? null,
        readAt: response.readAt?.toISOString() ?? null,
        failureReason: response.failureReason,
      },
    }
  }
}
