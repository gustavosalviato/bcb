import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { authenticateClient } from '../../middlewares/authenticate-client'
import { errorResponse } from '../../../utils/schema/error-response'
import { validationErrorResponse } from '../../../utils/schema/validation-error-response'
import { makeGetMessageUseCase } from '../../../use-cases/message/factories/make-get-message'

export const getMessageRoute: FastifyPluginAsyncZod = async app => {
  app.get('/messages/:messageId', {
    preHandler: [authenticateClient],
    schema: {
      summary: 'Get message by id',
      tags: ['messages'],
      params: z.object({
        messageId: z.string(),
      }),
      response: {
        200: z.object({
          message: z.object({
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
        }),
        400: validationErrorResponse,
        401: errorResponse.describe('Unauthorized'),
        404: errorResponse.describe('Message not found'),
      },
    },
    handler: async (request, reply) => {
      const { messageId } = request.params

      const useCase = makeGetMessageUseCase()

      const { message } = await useCase.execute({
        clientId: request.client!.id,
        messageId,
      })

      return reply.status(200).send({
        message,
      })
    },
  })
}
