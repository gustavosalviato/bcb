import { AppError } from './app-error'

export class ClientAlreadyExistsError extends AppError {
  constructor() {
    super('Client already exists', 409)
  }
}
