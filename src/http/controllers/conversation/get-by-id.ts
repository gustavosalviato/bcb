import { z } from "zod";

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { authenticateClient } from "../../middlewares/authenticate-client";
import { UnauthorizedError } from "../../../errors/unauthorized-error";
import { makeGetConversationByIdUseCase } from "../../../use-cases/conversation/factories/make-get-conversation-by-id";
import { errorResponse } from "../../../utils/schema/error-response";

export const getConversationByIdRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/conversations/:conversationId', {
    preHandler: [authenticateClient],
    schema: {
      summary: 'Get a conversation by id',
      description: 'Get a conversation by id',
      tags: ['conversations'],
      params: z.object({
        conversationId: z.string(),
      }),
      response: {
        200: z.object({
          conversation: z.object({
            id: z.string(),
            recipientId: z.string(),
            clientId: z.string(),
            recipientName: z.string(),
            lastMessageAt: z.string().nullable(),
            lastMessageContent: z.string().nullable(),
            unreadCount: z.number(),
            createdAt: z.string(),
          }),
        }),
        401: errorResponse.describe('Unauthorized'),
        404: errorResponse.describe('Conversation not found'),
      }
    },
    handler: async (request, reply) => {
      const { conversationId } = request.params;

      const getConversationByIdUseCase = makeGetConversationByIdUseCase();

      const { conversation } = await getConversationByIdUseCase.execute({
        clientId: request.client!.id,
        conversationId,
      })

      return reply.status(200).send({ conversation });
    }
  })
}