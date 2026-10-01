import { ClientAlreadyExistsError } from '../../errors/client-already-exists-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { CreateClientUseCase } from './create-client'

let clientRepository: InMemoryClientRepository
let sut: CreateClientUseCase

describe('Create client use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new CreateClientUseCase(clientRepository)
  })

  it('should be able to create a client', async () => {
    const { clientId } = await sut.execute({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    expect(clientId).toBeTruthy()
  })

  it('should not be able to create a client with same document id', async () => {
    await sut.execute({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        documentId: '1234567890',
        documentType: 'CPF',
        planType: 'prepaid',
      }),
    ).rejects.toBeInstanceOf(ClientAlreadyExistsError)
  })
})
