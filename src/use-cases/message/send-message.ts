import { MessagePriority } from '../../../generated/prisma/enums'
import { MessageRepository } from '../../repositories/message-repository'
import { MessageProcessor } from '../../services/processor/message-processor'

interface SendMessageUseCaseRequest {
  clientId: string
  conversationId: string
  content: string
  priority?: MessagePriority
}

interface SendMessageUseCaseResponse {
  messageId: string
  status: 'sent' | 'failed'
  cost: number
}

export class SendMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private messageProcessor: MessageProcessor,
  ) {}

  async execute({
    clientId,
    conversationId,
    content,
    priority = 'normal',
  }: SendMessageUseCaseRequest): Promise<SendMessageUseCaseResponse> {
    const message = await this.messageRepository.createQueuedWithCharge({
      clientId,
      conversationId,
      content,
      priority,
    })

    const result = await this.messageProcessor.enqueueAndProcess(message.id)

    return {
      messageId: message.id,
      status: result.status,
      cost: Number(message.cost),
    }
  }
}
