import { AppError } from './app-error'

export class MessageNotFoundError extends AppError {
  constructor() {
    super('Message not found', 404)
  }
}
