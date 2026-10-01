import { ConversationNotFoundError } from '../../errors/conversation-not-found-error'
import { InMemoryConversationRepository } from '../../repositories/in-memory/in-memory-conversation-repository'
import { GetConversationByIdUseCase } from './get-conversation-by-id'

let conversationRepository: InMemoryConversationRepository
let sut: GetConversationByIdUseCase

describe('Get conversation by id use case', () => {
  beforeEach(() => {
    conversationRepository = new InMemoryConversationRepository()
    sut = new GetConversationByIdUseCase(conversationRepository)
  })

  it('should be able to get a conversation by id', async () => {
    const clientId = '1234567890'

    const { id } = await conversationRepository.create({
      client: {
        connect: {
          id: clientId,
        },
      },
      recipientId: '1234567890',
      recipientName: 'John Doe',
    })

    const { conversation } = await sut.execute({
      conversationId: id,
      clientId,
    })

    expect(conversation).toBeTruthy()
    expect(conversation.recipientId).toBe('1234567890')
    expect(conversation.recipientName).toBe('John Doe')
  })

  it('should not be able to get a conversation by id if it does not exist', async () => {
    const clientId = '1234567890'

    await expect(() =>
      sut.execute({
        conversationId: 'non-existent-id',
        clientId,
      }),
    ).rejects.toBeInstanceOf(ConversationNotFoundError)
  })
})
