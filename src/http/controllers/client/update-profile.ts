import { z } from "zod";

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { validationErrorResponse } from "../../../utils/schema/validation-error-response";
import { makeUpdateClientUseCase } from "../../../use-cases/client/factories/make-update-client";
import { authenticateClient } from "../../middlewares/authenticate-client";
import { errorResponse } from "../../../utils/schema/error-response";

export const updateClientRoute: FastifyPluginAsyncZod = async (app) => {
  app.put('/clients/profile', {
    preHandler: [authenticateClient],
    schema: {
      summary: 'Update a client',
      description: 'Update a client',
      tags: ['clients'],
      body: z.object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
      }),
      response: {
        204: z.undefined(),
        404: errorResponse.describe('Client not found'),
        401: errorResponse.describe('Unauthorized'),
        400: validationErrorResponse,
      }
    },
    handler: async (request, reply) => {
      const { name } = request.body;

      const updateClientUseCase = makeUpdateClientUseCase()

      await updateClientUseCase.execute({
        clientId: request.client!.id,
        name,
      })

      return reply.status(204).send();
    }
  })
}