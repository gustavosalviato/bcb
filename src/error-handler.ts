import type { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { ZodError, z } from 'zod'

import { AppError } from './errors/app-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation.map(issue => ({
        field: issue.instancePath,
        message: issue.message,
      })),
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: z.treeifyError(error),
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    })
  }

  return reply.status(500).send({
    message: 'Internal server error',
  })
}
