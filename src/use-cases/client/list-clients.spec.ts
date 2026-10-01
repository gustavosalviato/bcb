import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { ListClientsUseCase } from './list-clients'

let clientRepository: InMemoryClientRepository
let sut: ListClientsUseCase

describe('List clients use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new ListClientsUseCase(clientRepository)
  })

  it('should be able to list all clients', async () => {
    await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    const { clients } = await sut.execute()

    expect(clients.length).toBe(1)
    expect(clients[0].id).toBeTruthy()
    expect(clients[0].name).toBe('John Doe')
    expect(clients[0].documentId).toBe('1234567890')
    expect(clients[0].documentType).toBe('CPF')
    expect(clients[0].planType).toBe('prepaid')
  })
})
