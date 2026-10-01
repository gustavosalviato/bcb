export interface MessageSender {
  send(messageId: string): Promise<void>
}

export class SimulatedMessageSender implements MessageSender {
  async send(messageId: string): Promise<void> {
    console.info(`[Simulated sender] Message sent: ${messageId}`)
  }
}
