import { z } from 'zod'

import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { validationErrorResponse } from '../../../utils/schema/validation-error-response'
import { makeGetClientByIdUseCase } from '../../../use-cases/client/factories/make-get-client-by-id'
import { verifyAdmin } from '../../middlewares/verify-admin'
import { errorResponse } from '../../../utils/schema/error-response'

export const getClientByIdRoute: FastifyPluginAsyncZod = async app => {
  app.get('/clients/:clientId', {
    preHandler: [verifyAdmin],
    schema: {
      summary: 'Get a client by id (admin only)',
      description: 'Get a client by id',
      tags: ['clients - admin'],
      params: z.object({
        clientId: z.string(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          documentId: z.string(),
          documentType: z.enum(['CPF', 'CNPJ']),
          balance: z.number(),
          limit: z.number(),
          planType: z.enum(['prepaid', 'postpaid']),
          active: z.boolean(),
        }),
        404: errorResponse.describe('Client not found'),
        401: errorResponse.describe('Unauthorized'),
        400: validationErrorResponse,
      },
    },
    handler: async (request, reply) => {
      const { clientId } = request.params

      const getClientByIdUseCase = makeGetClientByIdUseCase()

      const { client } = await getClientByIdUseCase.execute({
        clientId,
      })

      return reply.send(client)
    },
  })
}
