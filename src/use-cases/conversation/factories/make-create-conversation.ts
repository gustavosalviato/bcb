import { PrismaConversationRepository } from "../../../repositories/prisma/prisma-conversation-repository";
import { CreateConversationUseCase } from "../create-conversation";

export function makeCreateConversationUseCase() {
  const conversationRepository = new PrismaConversationRepository();
  return new CreateConversationUseCase(conversationRepository);
}