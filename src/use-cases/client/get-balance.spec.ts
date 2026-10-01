import { ClientNotFoundError } from '../../errors/client-not-found-error'
import { InMemoryClientRepository } from '../../repositories/in-memory/in-memory-client-repository'
import { GetBalanceUseCase } from './get-balance'

let clientRepository: InMemoryClientRepository
let sut: GetBalanceUseCase

describe('Get balance use case', () => {
  beforeEach(() => {
    clientRepository = new InMemoryClientRepository()
    sut = new GetBalanceUseCase(clientRepository)
  })

  it('should be able to get the balance of a client', async () => {
    const client = await clientRepository.create({
      name: 'John Doe',
      documentId: '1234567890',
      documentType: 'CPF',
      planType: 'prepaid',
      balance: 5,
    })

    const otherClient = await clientRepository.create({
      name: 'John Doe 2',
      documentId: '12345678901234',
      documentType: 'CNPJ',
      planType: 'postpaid',
      limit: 1,
    })

    const result = (await sut.execute({ clientId: client.id })!) as {
      planType: 'prepaid'
      balance: number
    }
    const otherClientResult = (await sut.execute({
      clientId: otherClient.id,
    })!) as { planType: 'postpaid'; monthlyLimit: number }

    expect(result.planType).toBe('prepaid')
    expect(result.balance).toBe(5)

    expect(otherClientResult.planType).toBe('postpaid')
    expect(otherClientResult.monthlyLimit).toBe(1)
  })

  it('should not be able to get the balance of a non-existent client', async () => {
    await expect(() =>
      sut.execute({ clientId: '1234567890' }),
    ).rejects.toBeInstanceOf(ClientNotFoundError)
  })
})
