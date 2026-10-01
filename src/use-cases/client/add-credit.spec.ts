import { ClientNotFoundError } from '../../errors/client-not-found-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { AddCreditUseCase } from './add-credit'

let clientRepository: InMemoryClientRepository
let sut: AddCreditUseCase

describe('Add credit use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new AddCreditUseCase(clientRepository)
  })

  it('should be able to add credit to a client', async () => {
    const client = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    await sut.execute({
      clientId: client.id,
      amount: 100,
    })
  })

  it('should not be able to add credit to a non-existent client', async () => {
    await expect(() =>
      sut.execute({
        amount: 100,
        clientId: '1234567890',
      }),
    ).rejects.toBeInstanceOf(ClientNotFoundError)
  })
})
