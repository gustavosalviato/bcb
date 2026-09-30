import { z } from "zod";

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { validationErrorResponse } from "../../../utils/schema/validation-error-response";
import { makeDeletelientUseCase } from "../../../use-cases/client/factories/make-delete-client";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { errorResponse } from "../../../utils/schema/error-response";

export const deleteClientRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete('/clients/:clientId', {
    preHandler: [verifyAdmin],
    schema: {
      summary: 'Delete a client (admin only)',
      description: 'Delete a client',
      tags: ['clients - admin'],
      params: z.object({
        clientId: z.string(),
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

      const deleteClientUseCase = makeDeletelientUseCase()

      await deleteClientUseCase.execute({
        clientId,
      })

      return reply.status(204).send();
    }
  })
}