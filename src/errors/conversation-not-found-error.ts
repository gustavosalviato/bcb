import { AppError } from "./app-error";

export class ConversationNotFoundError extends AppError {
  constructor() {
    super("Conversation not found", 404);
  }
}