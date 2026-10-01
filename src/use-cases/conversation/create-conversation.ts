import { ConversationRepository } from '../../repositories/conversation-repository'

interface CreateConversationUseCaseRequest {
  clientId: string
  recipientId: string
  recipientName: string
}

interface CreateConversationUseCaseResponse {
  conversationId: string
}

export class CreateConversationUseCase {
  constructor(private conversationRepository: ConversationRepository) {}

  async execute({
    clientId,
    recipientId,
    recipientName,
  }: CreateConversationUseCaseRequest): Promise<CreateConversationUseCaseResponse> {
    const conversation = await this.conversationRepository.create({
      client: {
        connect: {
          id: clientId,
        },
      },
      recipientId,
      recipientName,
    })

    return { conversationId: conversation.id }
  }
}
