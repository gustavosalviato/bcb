import { Prisma } from '../../generated/prisma/client'
import type { MessagePriority } from '../../generated/prisma/client'

export const MESSAGE_COST_NORMAL = new Prisma.Decimal('0.25')
export const MESSAGE_COST_URGENT = new Prisma.Decimal('0.50')

const COST_BY_PRIORITY: Record<MessagePriority, Prisma.Decimal> = {
  normal: MESSAGE_COST_NORMAL,
  urgent: MESSAGE_COST_URGENT,
}

export function getMessageCost(priority: MessagePriority): Prisma.Decimal {
  return COST_BY_PRIORITY[priority]
}

export function getMessageCostAsNumber(priority: MessagePriority): number {
  return getMessageCost(priority).toNumber()
}
