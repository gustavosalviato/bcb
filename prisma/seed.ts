import { Prisma } from '../generated/prisma/client'
import { prisma } from '../src/libs/prisma'
import {
  TRANSACTION_TYPE_CREDIT,
  TRANSACTION_TYPE_DEBIT,
} from '../src/utils/transaction-type'

const PREPAID_DOCUMENT_ID = '12345678000199'
const POSTPAID_DOCUMENT_ID = '98765432000188'
const INACTIVE_DOCUMENT_ID = '12345678909'

const DEMO_DOCUMENT_IDS = [
  PREPAID_DOCUMENT_ID,
  POSTPAID_DOCUMENT_ID,
  INACTIVE_DOCUMENT_ID,
]

const prepaidClientId = 'a1111111-1111-4111-8111-111111111111'
const postpaidClientId = 'a2222222-2222-4222-8222-222222222222'
const inactiveClientId = 'a3333333-3333-4333-8333-333333333333'

const mariaConversationId = 'c1111111-1111-4111-8111-111111111111'
const joaoConversationId = 'c1111111-1111-4111-8111-111111111112'
const anaConversationId = 'c2222222-2222-4222-8222-222222222221'

function minutesAgo(now: Date, minutes: number): Date {
  return new Date(now.getTime() - minutes * 60_000)
}

async function clearDemoClients() {
  const clients = await prisma.client.findMany({
    where: { documentId: { in: DEMO_DOCUMENT_IDS } },
    select: { id: true },
  })

  const clientIds = clients.map(client => client.id)

  if (clientIds.length === 0) {
    return
  }

  await prisma.transaction.deleteMany({
    where: { clientId: { in: clientIds } },
  })

  await prisma.message.deleteMany({
    where: { conversation: { clientId: { in: clientIds } } },
  })

  await prisma.conversation.deleteMany({
    where: { clientId: { in: clientIds } },
  })

  await prisma.client.deleteMany({
    where: { id: { in: clientIds } },
  })
}

async function seed() {
  const now = new Date()
  const mariaAt = minutesAgo(now, 8)
  const mariaUrgentAt = minutesAgo(now, 6)
  const mariaFailedAt = minutesAgo(now, 4)
  const joaoAt = minutesAgo(now, 2)
  const anaAt = minutesAgo(now, 7)
  const anaUrgentAt = minutesAgo(now, 3)
  const prepaidCreditAt = minutesAgo(now, 30)

  await clearDemoClients()

  await prisma.client.create({
    data: {
      id: prepaidClientId,
      name: 'Empresa ABC',
      documentId: PREPAID_DOCUMENT_ID,
      documentType: 'CNPJ',
      planType: 'prepaid',
      balance: new Prisma.Decimal('1.25'),
      limit: new Prisma.Decimal('0'),
      active: true,
      conversations: {
        create: [
          {
            id: mariaConversationId,
            recipientId: '5511999990001',
            recipientName: 'Maria Souza',
            unreadCount: 0,
            lastMessageContent: 'Não foi possível enviar o código de rastreio.',
            lastMessageAt: mariaFailedAt,
            createdAt: minutesAgo(now, 10),
            messages: {
              create: [
                {
                  id: 'm1111111-1111-4111-8111-111111111111',
                  content: 'Olá, Maria. Seu pedido foi confirmado.',
                  priority: 'normal',
                  status: 'sent',
                  cost: new Prisma.Decimal('0.25'),
                  createdAt: mariaAt,
                  sentAt: mariaAt,
                  transaction: {
                    create: {
                      id: 't1111111-1111-4111-8111-111111111111',
                      clientId: prepaidClientId,
                      amount: new Prisma.Decimal('0.25'),
                      type: TRANSACTION_TYPE_DEBIT,
                      balanceAfter: new Prisma.Decimal('2.25'),
                      createdAt: mariaAt,
                    },
                  },
                },
                {
                  id: 'm1111111-1111-4111-8111-111111111112',
                  content: 'Entrega hoje até as 18h.',
                  priority: 'urgent',
                  status: 'sent',
                  cost: new Prisma.Decimal('0.50'),
                  createdAt: mariaUrgentAt,
                  sentAt: mariaUrgentAt,
                  transaction: {
                    create: {
                      id: 't1111111-1111-4111-8111-111111111112',
                      clientId: prepaidClientId,
                      amount: new Prisma.Decimal('0.50'),
                      type: TRANSACTION_TYPE_DEBIT,
                      balanceAfter: new Prisma.Decimal('1.75'),
                      createdAt: mariaUrgentAt,
                    },
                  },
                },
                {
                  id: 'm1111111-1111-4111-8111-111111111113',
                  content: 'Não foi possível enviar o código de rastreio.',
                  priority: 'normal',
                  status: 'failed',
                  cost: new Prisma.Decimal('0.25'),
                  failureReason: 'Falha simulada no envio',
                  createdAt: mariaFailedAt,
                  transaction: {
                    create: {
                      id: 't1111111-1111-4111-8111-111111111113',
                      clientId: prepaidClientId,
                      amount: new Prisma.Decimal('0.25'),
                      type: TRANSACTION_TYPE_DEBIT,
                      balanceAfter: new Prisma.Decimal('1.50'),
                      createdAt: mariaFailedAt,
                    },
                  },
                },
              ],
            },
          },
          {
            id: joaoConversationId,
            recipientId: '5511988880002',
            recipientName: 'João Lima',
            unreadCount: 0,
            lastMessageContent: 'João, o boleto segue em anexo.',
            lastMessageAt: joaoAt,
            createdAt: minutesAgo(now, 5),
            messages: {
              create: [
                {
                  id: 'm1111111-1111-4111-8111-111111111114',
                  content: 'João, o boleto segue em anexo.',
                  priority: 'normal',
                  status: 'sent',
                  cost: new Prisma.Decimal('0.25'),
                  createdAt: joaoAt,
                  sentAt: joaoAt,
                  transaction: {
                    create: {
                      id: 't1111111-1111-4111-8111-111111111114',
                      clientId: prepaidClientId,
                      amount: new Prisma.Decimal('0.25'),
                      type: TRANSACTION_TYPE_DEBIT,
                      balanceAfter: new Prisma.Decimal('1.25'),
                      createdAt: joaoAt,
                    },
                  },
                },
              ],
            },
          },
        ],
      },
      transactions: {
        create: [
          {
            id: 't1111111-1111-4111-8111-111111111110',
            amount: new Prisma.Decimal('2.50'),
            type: TRANSACTION_TYPE_CREDIT,
            balanceAfter: new Prisma.Decimal('2.50'),
            createdAt: prepaidCreditAt,
          },
        ],
      },
    },
  })

  await prisma.client.create({
    data: {
      id: postpaidClientId,
      name: 'Loja Norte',
      documentId: POSTPAID_DOCUMENT_ID,
      documentType: 'CNPJ',
      planType: 'postpaid',
      balance: new Prisma.Decimal('0'),
      limit: new Prisma.Decimal('2.75'),
      active: true,
      conversations: {
        create: [
          {
            id: anaConversationId,
            recipientId: '5511977770003',
            recipientName: 'Ana Costa',
            unreadCount: 0,
            lastMessageContent: 'Ana, sua fatura vence amanhã.',
            lastMessageAt: anaUrgentAt,
            createdAt: minutesAgo(now, 9),
            messages: {
              create: [
                {
                  id: 'm2222222-2222-4222-8222-222222222221',
                  content: 'Ana, recebemos o seu contato.',
                  priority: 'normal',
                  status: 'sent',
                  cost: new Prisma.Decimal('0.25'),
                  createdAt: anaAt,
                  sentAt: anaAt,
                  transaction: {
                    create: {
                      id: 't2222222-2222-4222-8222-222222222221',
                      clientId: postpaidClientId,
                      amount: new Prisma.Decimal('0.25'),
                      type: TRANSACTION_TYPE_DEBIT,
                      balanceAfter: new Prisma.Decimal('2.50'),
                      createdAt: anaAt,
                    },
                  },
                },
                {
                  id: 'm2222222-2222-4222-8222-222222222222',
                  content: 'Ana, sua fatura vence amanhã.',
                  priority: 'urgent',
                  status: 'sent',
                  cost: new Prisma.Decimal('0.50'),
                  createdAt: anaUrgentAt,
                  sentAt: anaUrgentAt,
                  transaction: {
                    create: {
                      id: 't2222222-2222-4222-8222-222222222222',
                      clientId: postpaidClientId,
                      amount: new Prisma.Decimal('0.50'),
                      type: TRANSACTION_TYPE_DEBIT,
                      balanceAfter: new Prisma.Decimal('2.00'),
                      createdAt: anaUrgentAt,
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  })

  await prisma.client.create({
    data: {
      id: inactiveClientId,
      name: 'Cliente Inativo',
      documentId: INACTIVE_DOCUMENT_ID,
      documentType: 'CPF',
      planType: 'prepaid',
      balance: new Prisma.Decimal('0'),
      limit: new Prisma.Decimal('0'),
      active: false,
    },
  })

  console.log('Seed concluído.')
  console.log('Empresa ABC (pré-pago):', PREPAID_DOCUMENT_ID)
  console.log('Loja Norte (pós-pago):', POSTPAID_DOCUMENT_ID)
  console.log('Cliente Inativo (pré-pago):', INACTIVE_DOCUMENT_ID)
}

seed()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
