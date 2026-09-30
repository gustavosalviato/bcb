import { z } from "zod";

import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { makeCreateClientUseCase } from "../../../use-cases/client/factories/make-create-client";
import { validationErrorResponse } from "../../../utils/schema/validation-error-response";
import { errorResponse } from "../../../utils/schema/error-response";

export const createClientRoute: FastifyPluginAsyncZod = async (app) => {
  app.post('/clients', {
    schema: {
      summary: 'Create a new client',
      description: 'Create a new client',
      tags: ['clients'],
      body: z.object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        documentId: z.string().min(11).max(14).regex(/^\d+$/, "Use somente números"),
        documentType: z.enum(['CPF', 'CNPJ']),
        planType: z.enum(['prepaid', 'postpaid']),
      }).superRefine((data, context) => {
        const expectedLength = data.documentType === 'CPF' ? 11 : 14;

        if (data.documentId.length !== expectedLength) {
          context.addIssue({
            code: "custom",
            path: ['documentId'],
            message: `${data.documentType} deve ter ${expectedLength} dígitos`,
          })
        }
      }),
      response: {
        201: z.object({
          clientId: z.string(),
        }).describe('Client created successfully'),
        409: errorResponse.describe('Client already exists'),
        400: validationErrorResponse,
      }
    },
    handler: async (request, reply) => {
      const { name, documentId, documentType, planType } = request.body;

      const createClientUseCase = makeCreateClientUseCase()

      const { clientId } = await createClientUseCase.execute({
        name,
        documentId,
        documentType,
        planType,
      })

      return reply.status(201).send({ clientId });
    }
  })
}