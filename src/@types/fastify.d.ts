import type { Client } from '../../generated/prisma/client'

declare module 'fastify' {
  interface FastifyRequest {
    client?: Client
  }
}
