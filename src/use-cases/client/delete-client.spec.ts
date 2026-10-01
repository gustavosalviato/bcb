import { ClientNotFoundError } from '../../errors/client-not-found-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { DeleteClientUseCase } from './delete-client'

let clientRepository: InMemoryClientRepository
let sut: DeleteClientUseCase

describe('Delete client use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new DeleteClientUseCase(clientRepository)
  })

  it('should be able to delete a client', async () => {
    const client = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    await sut.execute({ clientId: client.id })

    expect(client.active).toBe(false)
  })

  it('should not be able to delete a non-existent client', async () => {
    await expect(() =>
      sut.execute({ clientId: '1234567890' }),
    ).rejects.toBeInstanceOf(ClientNotFoundError)
  })
})
