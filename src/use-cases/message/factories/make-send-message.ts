import { PrismaMessageRepository } from '../../../repositories/prisma/prisma-message-repository'
import { messageProcessor } from '../../../services/processor/factories/make-message-processor'
import { SendMessageUseCase } from '../send-message'

export function makeSendMessageUseCase() {
  return new SendMessageUseCase(new PrismaMessageRepository(), messageProcessor)
}
