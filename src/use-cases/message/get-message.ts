import type { MessageRepository } from '../../repositories/message-repository'
import { MessagePriority, MessageStatus } from '../../../generated/prisma/enums'
import { MessageNotFoundError } from '../../errors/message-not-found-error'

interface GetMessageUseCaseRequest {
  clientId: string
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
  constructor(private messageRepository: MessageRepository) {}

  async execute({
    clientId,
    messageId,
  }: GetMessageUseCaseRequest): Promise<GetMessageUseCaseResponse> {
    const response = await this.messageRepository.findByIdAndClientId(
      messageId,
      clientId,
    )

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
