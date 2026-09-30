import { PrismaConversationRepository } from "../../../repositories/prisma/prisma-conversation-repository";
import { ListConversationsUseCase } from "../list-conversations";

export function makeListConversationsUseCase() {
  const conversationRepository = new PrismaConversationRepository();
  return new ListConversationsUseCase(conversationRepository);
}