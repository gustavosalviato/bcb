import { Prisma } from '../../../generated/prisma/browser'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { InMemoryConversationRepository } from '../../repositories/in-memory/in-memory-conversation-repository'
import { InMemoryMessageRepository } from '../../repositories/in-memory/in-memory-message-repository'
import { ListConversationMessagesUseCase } from './list-conversation-messages'

let messageRepository: InMemoryMessageRepository
let conversationRepository: InMemoryConversationRepository
let clientRepository: InMemoryClientRepository
let sut: ListConversationMessagesUseCase

describe('Send message use case', () => {
  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository()
    conversationRepository = new InMemoryConversationRepository()
    clientRepository = new InMemoryClientRepository()

    sut = new ListConversationMessagesUseCase(
      conversationRepository,
      messageRepository,
    )
  })

  it('should be able to list conversation messages', async () => {
    const client = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
      balance: new Prisma.Decimal(1),
      limit: new Prisma.Decimal(1),
    })

    const conversation = await conversationRepository.create({
      recipientId: 'user_123',
      recipientName: 'John Doe',
      client: {
        connect: {
          id: client.id,
        },
      },
    })

    const message = await messageRepository.create({
      content: 'Hello, how are you?',
      conversation: {
        connect: {
          id: conversation.id,
        },
      },
      priority: 'normal',
      cost: 0.25,
    })

    messageRepository.items.push(message)

    const { messages } = await sut.execute({
      clientId: client.id,
      conversationId: conversation.id,
    })

    expect(messages).toHaveLength(1)
    expect(messages[0].id).toBe(message.id)
    expect(messages[0].content).toBe(message.content)
  })
})
