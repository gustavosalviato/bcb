import { AppError } from "./app-error";

export class InsufficientBalanceError extends AppError {
  constructor() {
    super("Insufficient balance", 402);
  }
}