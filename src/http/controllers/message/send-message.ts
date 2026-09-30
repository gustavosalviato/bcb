import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { makeSendMessageUseCase } from "../../../use-cases/message/factories/make-send-message";
import { authenticateClient } from "../../middlewares/authenticate-client";
import { validationErrorResponse } from "../../../utils/schema/validation-error-response";
import { errorResponse } from "../../../utils/schema/error-response";

export const sendMessageRoute: FastifyPluginAsyncZod = async (app) => {
  app.post("/messages", {
    preHandler: [authenticateClient],
    schema: {
      summary: "Send message",
      description:
        "Validates balance or limit, registers the charge and processes the message in a FIFO queue before responding.",
      tags: ["messages"],
      body: z.object({
        conversationId: z.string(),
        content: z.string().trim().min(1, "Informe o conteúdo"),
        priority: z.enum(["normal", "urgent"]).default("normal"),
      }),
      response: {
        201: z.object({
          messageId: z.string(),
          status: z.enum(["sent", "failed"]),
          cost: z.number(),
        }),
        400: validationErrorResponse,
        401: errorResponse.describe('Unauthorized'),
        402: errorResponse.describe('Insufficient balance'),
        404: errorResponse.describe('Conversation not found'),
        409: errorResponse.describe('Monthly limit reached'),
      },
    },

    handler: async (request, reply) => {
      const { conversationId, content, priority } = request.body;

      const useCase = makeSendMessageUseCase();

      const result = await useCase.execute({
        clientId: request.client!.id,
        conversationId,
        content,
        priority,
      });

      return reply.status(201).send(result);
    },
  });
};