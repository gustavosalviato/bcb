import { InMemoryConversationRepository } from '../../repositories/in-memory/in-memory-conversation-repository'
import { ListConversationsUseCase } from './list-conversations'

let conversationRepository: InMemoryConversationRepository
let sut: ListConversationsUseCase

describe('Get conversation by id use case', () => {
  beforeEach(() => {
    conversationRepository = new InMemoryConversationRepository()
    sut = new ListConversationsUseCase(conversationRepository)
  })

  it('should be able to get a conversation by id', async () => {
    const clientId = '1234567890'

    await conversationRepository.create({
      client: {
        connect: {
          id: clientId,
        },
      },
      recipientId: '1234567890',
      recipientName: 'John Doe',
    })

    const { conversations } = await sut.execute({
      clientId,
    })

    expect(conversations).toBeTruthy()
    expect(conversations.length).toBe(1)
    expect(conversations[0].recipientId).toBe('1234567890')
    expect(conversations[0].recipientName).toBe('John Doe')
  })
})
