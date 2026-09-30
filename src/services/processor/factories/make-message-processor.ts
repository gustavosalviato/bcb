import { PrismaMessageRepository } from "../../../repositories/prisma/prisma-message-repository";
import { messageQueue } from "../../queue/message-queue";
import { SimulatedMessageSender } from "../../sender/message-sender";
import { MessageProcessor } from "../message-processor";

export const messageProcessor = new MessageProcessor(
  messageQueue,
  new PrismaMessageRepository(),
  new SimulatedMessageSender(),
);