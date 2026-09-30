import type {
  Message,
  Prisma,
} from "../../generated/prisma/client";

export interface CreateQueuedMessageInput {
  clientId: string;
  conversationId: string;
  content: string;
  priority: Message["priority"];
}


export interface MessageRepository {
  createQueuedWithCharge(data: CreateQueuedMessageInput): Promise<Message>;
  markAsProcessing(messageId: string): Promise<void>;
  markAsSent(messageId: string): Promise<void>;
  markAsFailed(messageId: string, failureReason: string): Promise<void>;
  findManyByConversationId(conversationId: string): Promise<Message[]>;
}