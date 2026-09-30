import { z } from "zod";

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { validationErrorResponse } from "../../../utils/schema/validation-error-response";
import { authenticateClient } from "../../middlewares/authenticate-client";
import { makeListConversationsUseCase } from "../../../use-cases/conversation/factories/make-list-conversations";
import { errorResponse } from "../../../utils/schema/error-response";

export const listConversationsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/conversations', {
    preHandler: [authenticateClient],
    schema: {
      summary: 'List all conversations',
      description: 'List all conversations',
      tags: ['conversations'],
      response: {
        200: z.object({
          conversations: z.array(z.object({
            id: z.string(),
            recipientId: z.string(),
            clientId: z.string(),
            recipientName: z.string(),
            lastMessageAt: z.string().nullable(),
            lastMessageContent: z.string().nullable(),
            unreadCount: z.number(),
            createdAt: z.string(),
          })),
        }),
        401: errorResponse.describe('Unauthorized'),
        400: validationErrorResponse,
      }
    },
    handler: async (request, reply) => {
      const listConversationsUseCase = makeListConversationsUseCase()

      const { conversations } = await listConversationsUseCase.execute({
        clientId: request.client!.id,
      })

      return reply.status(200).send({ conversations });
    }
  })
}