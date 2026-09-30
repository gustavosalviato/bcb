import { AppError } from "./app-error";

export class MonthlyLimitExceedError extends AppError {
  constructor() {
    super("Monthly limit exceeded", 409);
  }
}