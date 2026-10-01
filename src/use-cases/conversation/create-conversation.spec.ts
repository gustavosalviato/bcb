import { InMemoryConversationRepository } from '../../repositories/in-memory/in-memory-conversation-repository'
import { CreateConversationUseCase } from './create-conversation'

let conversationRepository: InMemoryConversationRepository
let sut: CreateConversationUseCase

describe('Create conversation use case', () => {
  beforeEach(() => {
    conversationRepository = new InMemoryConversationRepository()
    sut = new CreateConversationUseCase(conversationRepository)
  })

  it('should be able to create a conversation', async () => {
    const { conversationId } = await sut.execute({
      clientId: '1234567890',
      recipientId: '1234567890',
      recipientName: 'John Doe',
    })

    expect(conversationId).toBeTruthy()
  })
})
