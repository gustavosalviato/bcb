import { randomUUID } from 'crypto'
import { Transaction } from '../../../generated/prisma/browser'
import { Message, Prisma } from '../../../generated/prisma/client'
import { ClientNotFoundError } from '../../errors/client-not-found-error'
import { ConversationNotFoundError } from '../../errors/conversation-not-found-error'
import { InsufficientBalanceError } from '../../errors/insufficient-balance-error'
import { MonthlyLimitExceedError } from '../../errors/monthly-limit-exceed'
import { getMessageCost } from '../../utils/message-cost'
import { getMonthlyPeriod } from '../../utils/montly-period'
import { TRANSACTION_TYPE_DEBIT } from '../../utils/transaction-type'
import {
  CreateQueuedMessageInput,
  MessageRepository,
} from '../message-repository'
import { inMemoryConversationRepository } from './in-memory-conversation-repository'
import { inMemoryClientRepository } from './in-memory-client-repository'

export class InMemoryMessageRepository implements MessageRepository {
  public items: Message[] = []
  public transactions: Transaction[] = []

  async createQueuedWithCharge(data: CreateQueuedMessageInput) {
    const cost = getMessageCost(data.priority)

    const now = new Date()

    const conversation =
      await inMemoryConversationRepository.findByIdAndClientId(
        data.conversationId,
        data.clientId,
      )

    if (!conversation) throw new ConversationNotFoundError()

    const client = await inMemoryClientRepository.findById(data.clientId)

    if (!client || !client.active) throw new ClientNotFoundError()

    let balanceAfter: Prisma.Decimal

    if (client.planType === 'prepaid') {
      if (client.balance.lessThan(cost)) throw new InsufficientBalanceError()

      const newBalance = client.balance.minus(cost)

      await inMemoryClientRepository.save({ ...client, balance: newBalance })
      balanceAfter = newBalance
    } else {
      const { start, end } = getMonthlyPeriod(now)
      const monthlyUsage = this.transactions
        .filter(
          t =>
            t.clientId === client.id &&
            t.type === TRANSACTION_TYPE_DEBIT &&
            t.messageId != null &&
            t.createdAt >= start &&
            t.createdAt < end,
        )
        .reduce((sum, t) => sum.plus(t.amount), new Prisma.Decimal('0'))

      const usageAfter = monthlyUsage.plus(cost)

      if (usageAfter.greaterThan(client.limit)) {
        throw new MonthlyLimitExceedError()
      }
      balanceAfter = client.limit.minus(usageAfter)
    }

    const message: Message = {
      id: randomUUID(),
      conversationId: conversation.id,
      content: data.content,
      priority: data.priority,
      status: 'queued',
      cost,
      createdAt: now,
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      failureReason: null,
    }

    this.items.push(message)

    this.transactions.push({
      id: randomUUID(),
      clientId: client.id,
      messageId: message.id,
      amount: cost,
      type: TRANSACTION_TYPE_DEBIT,
      balanceAfter,
      createdAt: now,
    })

    await inMemoryConversationRepository.save({
      ...conversation,
      lastMessageContent: message.content,
      lastMessageAt: message.createdAt,
    })

    return message
  }

  async markAsProcessing(messageId: string) {
    const message = this.items.find(
      item => item.id === messageId && item.status === 'queued',
    )

    if (message) {
      message.status = 'processing'
      message.failureReason = null
    }
  }

  async markAsSent(messageId: string) {
    const message = this.items.find(
      item => item.id === messageId && item.status === 'processing',
    )

    if (message) {
      message.status = 'sent'
      message.sentAt = new Date()
      message.failureReason = null
    }
  }

  async markAsFailed(messageId: string, failureReason: string) {
    const message = this.items.find(
      item => item.id === messageId && item.status === 'processing',
    )

    if (message) {
      message.status = 'failed'
      message.failureReason = failureReason
    }
  }

  async findManyByConversationId(conversationId: string) {
    return this.items.filter(item => item.conversationId === conversationId)
  }

  async create(data: Prisma.MessageCreateInput) {
    const message: Message = {
      id: data.id ?? randomUUID(),
      conversationId: data.conversation.connect?.id ?? '',
      content: data.content,
      priority: data.priority ?? 'normal',
      status: 'queued',
      cost: new Prisma.Decimal(Number(data.cost)),
      createdAt: new Date(),
      sentAt: new Date() ?? null,
      deliveredAt: null,
      readAt: null,
      failureReason: null,
    }

    return message
  }

  async findById(messageId: string): Promise<Message | null> {
    return this.items.find(item => item.id === messageId) ?? null
  }
}
