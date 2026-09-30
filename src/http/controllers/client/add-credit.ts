import { z } from "zod";

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { validationErrorResponse } from "../../../utils/schema/validation-error-response";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { makeAddCreditUseCase } from "../../../use-cases/client/factories/make-add-credit";
import { errorResponse } from "../../../utils/schema/error-response";

export const addCreditRoute: FastifyPluginAsyncZod = async (app) => {
  app.post('/clients/:clientId/credits', {
    preHandler: [verifyAdmin],
    schema: {
      summary: 'Add credit to a client (admin only)',
      description: 'Add credit to a client',
      tags: ['clients - admin'],
      params: z.object({
        clientId: z.string(),
      }),
      body: z.object({
        amount: z.number().positive(),
      }),
      response: {
        204: z.undefined(),
        404: errorResponse.describe('Client not found'),
        401: errorResponse.describe('Unauthorized'),
        400: validationErrorResponse,
      }
    },
    handler: async (request, reply) => {
      const { clientId } = request.params;
      const { amount } = request.body;

      const addCreditUseCase = makeAddCreditUseCase()

      await addCreditUseCase.execute({
        clientId,
        amount,
      })

      return reply.status(204).send();
    }
  })
}