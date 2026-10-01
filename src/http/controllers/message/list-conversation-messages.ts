import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { makeListConversationMessagesUseCase } from '../../../use-cases/message/factories/make-list-conversation-messages'
import { authenticateClient } from '../../middlewares/authenticate-client'
import { errorResponse } from '../../../utils/schema/error-response'
import { validationErrorResponse } from '../../../utils/schema/validation-error-response'

export const listConversationMessagesRoute: FastifyPluginAsyncZod =
  async app => {
    app.get('/conversations/:conversationId/messages', {
      preHandler: [authenticateClient],
      schema: {
        summary: 'List messages by conversation',
        tags: ['messages'],
        params: z.object({
          conversationId: z.string(),
        }),
        response: {
          200: z.object({
            messages: z.array(
              z.object({
                id: z.string(),
                conversationId: z.string(),
                content: z.string(),
                priority: z.enum(['normal', 'urgent']),
                status: z.enum([
                  'queued',
                  'processing',
                  'sent',
                  'delivered',
                  'read',
                  'failed',
                ]),
                cost: z.number(),
                createdAt: z.iso.datetime(),
                sentAt: z.iso.datetime().nullable(),
                deliveredAt: z.iso.datetime().nullable(),
                readAt: z.iso.datetime().nullable(),
                failureReason: z.string().nullable(),
              }),
            ),
          }),
          400: validationErrorResponse,
          401: errorResponse.describe('Unauthorized'),
          404: errorResponse.describe('Conversation not found'),
        },
      },
      handler: async (request, reply) => {
        const { conversationId } = request.params

        const useCase = makeListConversationMessagesUseCase()

        const { messages } = await useCase.execute({
          clientId: request.client!.id,
          conversationId,
        })

        return reply.status(200).send({
          messages,
        })
      },
    })
  }
