import { MessageQueue } from './message-queue'

let queue: MessageQueue

describe('MessageQueue', () => {
  beforeEach(() => {
    queue = new MessageQueue()
  })

  it('should be able to enqueue and dequeue a message', () => {
    queue.enqueue({ messageId: '1' })

    expect(queue.dequeue()).toEqual({ messageId: '1' })
    expect(queue.size).toBe(0)
  })

  it('should be able to dequeue a message in the correct order', () => {
    queue.enqueue({ messageId: '1' })
    queue.enqueue({ messageId: '2' })
    queue.enqueue({ messageId: '3' })

    expect(queue.dequeue()).toEqual({ messageId: '1' })
    expect(queue.size).toBe(2)

    expect(queue.dequeue()).toEqual({ messageId: '2' })
    expect(queue.size).toBe(1)

    expect(queue.dequeue()).toEqual({ messageId: '3' })
    expect(queue.size).toBe(0)
  })

  it('should return null if the queue is empty', () => {
    expect(queue.dequeue()).toBeNull()
  })
})
