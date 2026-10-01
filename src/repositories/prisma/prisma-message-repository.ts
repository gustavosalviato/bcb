import { prisma } from '../../libs/prisma'
import { Message, Prisma } from '../../../generated/prisma/client'
import { getMessageCost } from '../../utils/message-cost'
import {
  CreateQueuedMessageInput,
  MessageRepository,
} from '../message-repository'
import { ConversationNotFoundError } from '../../errors/conversation-not-found-error'
import { ClientNotFoundError } from '../../errors/client-not-found-error'
import { InsufficientBalanceError } from '../../errors/insufficient-balance-error'
import { TRANSACTION_TYPE_DEBIT } from '../../utils/transaction-type'
import { getMonthlyPeriod } from '../../utils/montly-period'
import { MonthlyLimitExceedError } from '../../errors/monthly-limit-exceed'

export class PrismaMessageRepository implements MessageRepository {
  async createQueuedWithCharge(
    data: CreateQueuedMessageInput,
  ): Promise<Message> {
    const cost = getMessageCost(data.priority)

    return prisma.$transaction(
      async tx => {
        const conversation = await tx.conversation.findFirst({
          where: {
            id: data.conversationId,
            clientId: data.clientId,
          },
        })

        if (!conversation) {
          throw new ConversationNotFoundError()
        }

        const client = await tx.client.findUnique({
          where: { id: data.clientId },
        })

        if (!client) {
          throw new ClientNotFoundError()
        }

        if (!client.active) {
          throw new ClientNotFoundError()
        }

        const now = new Date()
        let balanceAfter: Prisma.Decimal

        if (client.planType === 'prepaid') {
          const debitResult = await tx.client.updateMany({
            where: {
              id: client.id,
              active: true,
              planType: 'prepaid',
              balance: { gte: cost },
            },
            data: {
              balance: { decrement: cost },
            },
          })

          if (debitResult.count === 0) {
            throw new InsufficientBalanceError()
          }

          const clientAfter = await tx.client.findUniqueOrThrow({
            where: { id: client.id },
          })

          balanceAfter = clientAfter.balance
        } else {
          const { start, end } = getMonthlyPeriod(now)

          const result = await tx.transaction.aggregate({
            where: {
              clientId: client.id,
              type: TRANSACTION_TYPE_DEBIT,
              messageId: { not: null },
              createdAt: {
                gte: start,
                lt: end,
              },
            },
            _sum: {
              amount: true,
            },
          })

          const monthlyUsage = result._sum.amount ?? new Prisma.Decimal('0')

          const usageAfter = monthlyUsage.plus(cost)

          if (usageAfter.greaterThan(client.limit)) {
            throw new MonthlyLimitExceedError()
          }

          balanceAfter = client.limit.minus(usageAfter)
        }

        const message = await tx.message.create({
          data: {
            conversationId: conversation.id,
            content: data.content,
            priority: data.priority,
            status: 'queued',
            cost,
            createdAt: now,
          },
        })

        await tx.transaction.create({
          data: {
            clientId: client.id,
            messageId: message.id,
            amount: cost,
            type: TRANSACTION_TYPE_DEBIT,
            balanceAfter,
            createdAt: now,
          },
        })

        await tx.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageContent: message.content,
            lastMessageAt: message.createdAt,
          },
        })

        return message
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    )
  }

  async markAsProcessing(messageId: string): Promise<void> {
    const result = await prisma.message.updateMany({
      where: {
        id: messageId,
        status: 'queued',
      },
      data: {
        status: 'processing',
        failureReason: null,
      },
    })

    if (result.count === 0) {
      throw new Error(`Message ${messageId} was not found or is not queued`)
    }
  }

  async markAsSent(messageId: string): Promise<void> {
    const result = await prisma.message.updateMany({
      where: {
        id: messageId,
        status: 'processing',
      },
      data: {
        status: 'sent',
        sentAt: new Date(),
        failureReason: null,
      },
    })

    if (result.count === 0) {
      throw new Error(`Message ${messageId} was not found or is not processing`)
    }
  }

  async markAsFailed(messageId: string, failureReason: string): Promise<void> {
    const result = await prisma.message.updateMany({
      where: {
        id: messageId,
        status: 'processing',
      },
      data: {
        status: 'failed',
        failureReason,
      },
    })

    if (result.count === 0) {
      throw new Error(`Message ${messageId} was not found or is not processing`)
    }
  }

  async findManyByConversationId(conversationId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }
}
