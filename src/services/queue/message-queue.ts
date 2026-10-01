export interface QueuedMessage {
  messageId: string
}

export class MessageQueue {
  private items = new Map<number, QueuedMessage>()
  private head = 0
  private tail = 0

  enqueue(message: QueuedMessage): void {
    this.items.set(this.tail, message)
    this.tail++
  }

  dequeue(): QueuedMessage | null {
    if (this.size === 0) {
      return null
    }

    const message = this.items.get(this.head)!

    this.items.delete(this.head)
    this.head++

    if (this.size === 0) {
      this.head = 0
      this.tail = 0
    }

    return message
  }

  get size(): number {
    return this.tail - this.head
  }
}

export const messageQueue = new MessageQueue()
