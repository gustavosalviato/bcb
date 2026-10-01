import { ClientNotFoundError } from '../../errors/client-not-found-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { GetClientByIdUseCase } from './get-client-by-id'

let clientRepository: InMemoryClientRepository
let sut: GetClientByIdUseCase

describe('Get client by id use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new GetClientByIdUseCase(clientRepository)
  })

  it('should be able to get a client by id', async () => {
    const createdClient = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    const { client } = await sut.execute({ clientId: createdClient.id })

    expect(client.id).toEqual(createdClient.id)
    expect(client.name).toEqual(createdClient.name)
    expect(client.documentId).toEqual(createdClient.documentId)
    expect(client.documentType).toEqual(createdClient.documentType)
    expect(client.planType).toEqual(createdClient.planType)
  })

  it('should not be able to get a client by a non-existent id', async () => {
    await expect(() =>
      sut.execute({ clientId: '1234567890' }),
    ).rejects.toBeInstanceOf(ClientNotFoundError)
  })
})
