import { z } from 'zod'

import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { makeListClientsUseCase } from '../../../use-cases/client/factories/make-list-clients'
import { verifyAdmin } from '../../middlewares/verify-admin'
import { errorResponse } from '../../../utils/schema/error-response'

export const listClientsRoute: FastifyPluginAsyncZod = async app => {
  app.get('/clients', {
    preHandler: [verifyAdmin],
    schema: {
      summary: 'List all clients (admin only)',
      description: 'List all clients',
      tags: ['clients - admin'],
      response: {
        200: z.object({
          clients: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              documentId: z.string(),
              documentType: z.enum(['CPF', 'CNPJ']),
              balance: z.number(),
              limit: z.number(),
              planType: z.enum(['prepaid', 'postpaid']),
              active: z.boolean(),
            }),
          ),
        }),
        401: errorResponse.describe('Unauthorized'),
      },
    },
    handler: async (request, reply) => {
      const listClientsUseCase = makeListClientsUseCase()

      const { clients } = await listClientsUseCase.execute()

      return reply.send({ clients })
    },
  })
}
