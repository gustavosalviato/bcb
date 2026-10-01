import { ClientNotFoundError } from '../../errors/client-not-found-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { UpdateClientUseCase } from './update-client'

let clientRepository: InMemoryClientRepository
let sut: UpdateClientUseCase

describe('Update client use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new UpdateClientUseCase(clientRepository)
  })

  it('should be able to update a client', async () => {
    const createdClient = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    await sut.execute({ clientId: createdClient.id, name: 'Jane Doe' })

    const updatedClient = await clientRepository.findById(createdClient.id)

    expect(updatedClient?.name).toBe('Jane Doe')
  })

  it('should not be able to update a client with a non-existent id', async () => {
    await expect(() =>
      sut.execute({ clientId: '1234567890', name: 'Jane Doe' }),
    ).rejects.toBeInstanceOf(ClientNotFoundError)
  })
})
