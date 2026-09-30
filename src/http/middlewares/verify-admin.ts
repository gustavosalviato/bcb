import type { FastifyRequest } from "fastify";
import { env } from "../../env";
import { UnauthorizedError } from "../../errors/unauthorized-error";

export async function verifyAdmin(request: FastifyRequest) {
  const key = request.headers["x-admin-key"];

  if (!key || key !== env.ADMIN_API_KEY) {
    throw new UnauthorizedError();
  }
}