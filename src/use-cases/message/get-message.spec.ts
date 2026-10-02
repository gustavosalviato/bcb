import { Prisma } from '../../../generated/prisma/browser'
import { MessageNotFoundError } from '../../errors/message-not-found-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { InMemoryConversationRepository } from '../../repositories/in-memory/in-memory-conversation-repository'
import { InMemoryMessageRepository } from '../../repositories/in-memory/in-memory-message-repository'
import { GetMessageUseCase } from './get-message'

let messageRepository: InMemoryMessageRepository
let conversationRepository: InMemoryConversationRepository
let clientRepository: InMemoryClientRepository
let sut: GetMessageUseCase

describe('Get message use case', () => {
  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository()
    conversationRepository = new InMemoryConversationRepository()
    clientRepository = new InMemoryClientRepository()

    sut = new GetMessageUseCase(messageRepository, conversationRepository)
  })

  it('should be able to get a message', async () => {
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

    const { message: responseMessage } = await sut.execute({
      clientId: client.id,
      conversationId: conversation.id,
      messageId: message.id,
    })

    expect(responseMessage).toBeTruthy()
    expect(responseMessage.content).toEqual(message.content)
    expect(responseMessage.conversationId).toEqual(conversation.id)
    expect(responseMessage.priority).toEqual(message.priority)
  })

  it('should not be able to get a message if it does not exist', async () => {
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

    await expect(
      async () =>
        await sut.execute({
          clientId: client.id,
          conversationId: conversation.id,
          messageId: 'non-existent-message-id',
        }),
    ).rejects.toThrow(MessageNotFoundError)
  })
})
