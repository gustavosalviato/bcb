import { UnauthorizedError } from '../../errors/unauthorized-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { AuthenticateClientUseCase } from './authenticate-client'

let clientRepository: InMemoryClientRepository
let sut: AuthenticateClientUseCase

describe('Authenticate client use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new AuthenticateClientUseCase(clientRepository)
  })

  it('should be able to authenticate a client', async () => {
    const client = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
    })

    const result = await sut.execute({ documentId: client.documentId })

    expect(result).toBeTruthy()
    expect(result.name).toEqual(client.name)
    expect(result.documentId).toEqual(client.documentId)
    expect(result.planType).toEqual(client.planType)
  })

  it('should not be able to authenticate a client with non-existent document id', async () => {
    await expect(() =>
      sut.execute({ documentId: '1234567890' }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to authenticate a client with inactive account', async () => {
    const client = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
      active: false,
    })

    await expect(() =>
      sut.execute({ documentId: client.documentId }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
