import { MessageRepository } from '../../repositories/message-repository'
import { MessageQueue } from '../queue/message-queue'
import { MessageSender } from '../sender/message-sender'

type ProcessingResult = {
  messageId: string
  status: 'sent' | 'failed'
}

export class MessageProcessor {
  private pending: Promise<void> = Promise.resolve()

  constructor(
    private queue: MessageQueue,
    private messageRepository: MessageRepository,
    private sender: MessageSender,
  ) {}

  enqueueAndProcess(messageId: string): Promise<ProcessingResult> {
    this.queue.enqueue({ messageId })

    const processing = this.pending.then(() => this.processNext())

    // Uma falha não impede o processamento das próximas mensagens.
    this.pending = processing.then(
      () => undefined,
      () => undefined,
    )

    return processing
  }

  private async processNext(): Promise<ProcessingResult> {
    const message = this.queue.dequeue()

    if (!message) {
      throw new Error('No message available for processing')
    }

    const { messageId } = message

    await this.messageRepository.markAsProcessing(messageId)

    try {
      await this.sender.send(messageId)
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : 'Unexpected message sending failure'

      await this.messageRepository.markAsFailed(messageId, reason)

      return { messageId, status: 'failed' }
    }

    await this.messageRepository.markAsSent(messageId)

    return { messageId, status: 'sent' }
  }
}
