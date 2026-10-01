import { Prisma } from '../../../generated/prisma/browser'
import { InsufficientBalanceError } from '../../errors/insufficient-balance-error'
import { MonthlyLimitExceedError } from '../../errors/monthly-limit-exceed'
import { inMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { inMemoryConversationRepository } from '../../repositories/in-memory/in-memory-conversation-repository'
import { InMemoryMessageRepository } from '../../repositories/in-memory/in-memory-message-repository'
import { MessageProcessor } from '../../services/processor/message-processor'
import { MessageQueue } from '../../services/queue/message-queue'
import { SimulatedMessageSender } from '../../services/sender/message-sender'
import { SendMessageUseCase } from './send-message'

let messageRepository: InMemoryMessageRepository
let messageProcessor: MessageProcessor
let messageQueue: MessageQueue
let sender: SimulatedMessageSender
let sut: SendMessageUseCase

describe('Send message use case', () => {
  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository()
    messageQueue = new MessageQueue()
    sender = new SimulatedMessageSender()

    messageProcessor = new MessageProcessor(
      messageQueue,
      messageRepository,
      sender,
    )

    sut = new SendMessageUseCase(messageRepository, messageProcessor)
  })

  it('should be able to send a message with normal priority', async () => {
    const client = await inMemoryClientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
      balance: new Prisma.Decimal(1),
      limit: new Prisma.Decimal(1),
    })

    const conversation = await inMemoryConversationRepository.create({
      recipientId: 'user_123',
      recipientName: 'John Doe',
      client: {
        connect: {
          id: client.id,
        },
      },
    })

    const result = await sut.execute({
      clientId: client.id,
      content: 'Hello, how are you?',
      conversationId: conversation.id,
      priority: 'normal',
    })

    expect(result.cost).toEqual(0.25)
    expect(result.status).toEqual('sent')

    const clientAfter = await inMemoryClientRepository.findById(client.id)

    expect(Number(clientAfter?.balance)).toEqual(0.75)
  })

  it('should be able to send a message with urgent priority', async () => {
    const client = await inMemoryClientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
      balance: new Prisma.Decimal(1),
      limit: new Prisma.Decimal(1),
    })

    const conversation = await inMemoryConversationRepository.create({
      recipientId: 'user_123',
      recipientName: 'John Doe',
      client: {
        connect: {
          id: client.id,
        },
      },
    })

    const result = await sut.execute({
      clientId: client.id,
      content: 'Hello, how are you?',
      conversationId: conversation.id,
      priority: 'urgent',
    })

    expect(result.cost).toEqual(0.5)
    expect(result.status).toEqual('sent')

    const clientAfter = await inMemoryClientRepository.findById(client.id)

    expect(Number(clientAfter?.balance)).toEqual(0.5)
  })

  it('should not be able to send a message if the client has insufficient balance', async () => {
    const client = await inMemoryClientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
      balance: new Prisma.Decimal(0.25),
      limit: new Prisma.Decimal(1),
    })

    const conversation = await inMemoryConversationRepository.create({
      recipientId: 'user_123',
      recipientName: 'John Doe',
      client: {
        connect: {
          id: client.id,
        },
      },
    })

    await sut.execute({
      clientId: client.id,
      content: 'Hello, how are you?',
      conversationId: conversation.id,
      priority: 'normal',
    })

    await expect(() =>
      sut.execute({
        clientId: client.id,
        content: 'I need help',
        conversationId: conversation.id,
        priority: 'urgent',
      }),
    ).rejects.toThrow(InsufficientBalanceError)
  })

  it('should not be able to send a message when client monthly limit is reached', async () => {
    const client = await inMemoryClientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'postpaid',
      balance: new Prisma.Decimal(0.25),
      limit: new Prisma.Decimal(0.25),
    })

    const conversation = await inMemoryConversationRepository.create({
      recipientId: 'user_123',
      recipientName: 'John Doe',
      client: {
        connect: {
          id: client.id,
        },
      },
    })

    await sut.execute({
      clientId: client.id,
      content: 'Hello, how are you?',
      conversationId: conversation.id,
      priority: 'normal',
    })

    await expect(() =>
      sut.execute({
        clientId: client.id,
        content: 'I need help',
        conversationId: conversation.id,
        priority: 'urgent',
      }),
    ).rejects.toThrow(MonthlyLimitExceedError)
  })
})
