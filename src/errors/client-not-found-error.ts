import { AppError } from './app-error'

export class ClientNotFoundError extends AppError {
  constructor() {
    super('Client not found', 404)
  }
}
