import { PrismaConversationRepository } from "../../../repositories/prisma/prisma-conversation-repository";
import { GetConversationByIdUseCase } from "../get-conversation-by-id";

export function makeGetConversationByIdUseCase() {
  const conversationRepository = new PrismaConversationRepository();
  return new GetConversationByIdUseCase(conversationRepository);
}