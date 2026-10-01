import { z } from 'zod'
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { validationErrorResponse } from '../../../utils/schema/validation-error-response'
import { makeAuthenticateClientUseCase } from '../../../use-cases/auth/factories/make-authenticate-client'
import { errorResponse } from '../../../utils/schema/error-response'

export const authenticateRoute: FastifyPluginAsyncZod = async app => {
  app.post('/auth', {
    schema: {
      summary: 'Authenticate client by document',
      tags: ['auth'],
      body: z.object({
        documentId: z
          .string()
          .min(11)
          .max(14)
          .regex(/^\d+$/, 'Use somente números'),
      }),
      response: {
        200: z.object({
          clientId: z.string(),
          name: z.string(),
          planType: z.enum(['prepaid', 'postpaid']),
          documentId: z.string(),
        }),
        401: errorResponse.describe('Unauthorized'),
        400: validationErrorResponse,
      },
    },
    handler: async (request, reply) => {
      const { documentId } = request.body

      const useCase = makeAuthenticateClientUseCase()
      const result = await useCase.execute({ documentId })

      return reply.send(result)
    },
  })
}
