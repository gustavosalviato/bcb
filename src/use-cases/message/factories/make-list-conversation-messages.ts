import { PrismaConversationRepository } from "../../../repositories/prisma/prisma-conversation-repository";
import { PrismaMessageRepository } from "../../../repositories/prisma/prisma-message-repository";
import { ListConversationMessagesUseCase } from "../list-conversation-messages";

export function makeListConversationMessagesUseCase() {
  return new ListConversationMessagesUseCase(new PrismaConversationRepository(), new PrismaMessageRepository());
}