import { z } from 'zod'

import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { validationErrorResponse } from '../../../utils/schema/validation-error-response'
import { makeCreateConversationUseCase } from '../../../use-cases/conversation/factories/make-create-conversation'
import { authenticateClient } from '../../middlewares/authenticate-client'
import { errorResponse } from '../../../utils/schema/error-response'

export const createConversationRoute: FastifyPluginAsyncZod = async app => {
  app.post('/conversations', {
    preHandler: [authenticateClient],
    schema: {
      summary: 'Create a new conversation',
      description: 'Create a new conversation',
      tags: ['conversations'],
      body: z.object({
        recipientId: z.string(),
        recipientName: z
          .string()
          .min(2, 'Nome deve ter pelo menos 2 caracteres'),
      }),
      response: {
        201: z.object({
          conversationId: z.string(),
        }),
        401: errorResponse.describe('Unauthorized'),
        400: validationErrorResponse,
      },
    },
    handler: async (request, reply) => {
      const { recipientId, recipientName } = request.body

      const createConversationUseCase = makeCreateConversationUseCase()

      const { conversationId } = await createConversationUseCase.execute({
        clientId: request.client!.id,
        recipientId,
        recipientName,
      })

      return reply.status(201).send({ conversationId })
    },
  })
}
