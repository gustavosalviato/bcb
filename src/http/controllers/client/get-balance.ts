import { z } from "zod";

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { validationErrorResponse } from "../../../utils/schema/validation-error-response";
import { authenticateClient } from "../../middlewares/authenticate-client";
import { makeGetBalanceUseCase } from "../../../use-cases/client/factories/make-get-balance";
import { errorResponse } from "../../../utils/schema/error-response";

export const getBalanceRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/clients/balance', {
    preHandler: [authenticateClient],
    schema: {
      summary: 'Get balance of a client',
      description: 'Get balance of a client',
      tags: ['clients'],
      response: {
        200: z.discriminatedUnion("planType", [
          z.object({
            planType: z.literal("prepaid"),
            balance: z.number(),
          }),
          z.object({
            planType: z.literal("postpaid"),
            monthlyLimit: z.number(),
          }),
        ]),
        401: errorResponse.describe('Unauthorized'),
        400: validationErrorResponse,
      }
    },
    handler: async (request, reply) => {
      const getBalanceUseCase = makeGetBalanceUseCase()

      const response = await getBalanceUseCase.execute({
        clientId: request.client!.id,
      })

      return reply.send(response);
    }
  })
}