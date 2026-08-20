import type { FastifyReply, FastifyRequest } from "fastify";
import type { OrbisRole } from "../types.js";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const user = request.session.get("user");
  if (!user) return reply.code(401).send({ message: "Anmeldung erforderlich." });
  request.currentUser = user;
}

export function requireRole(...roles: OrbisRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    if (reply.sent) return;
    if (!request.currentUser || !roles.includes(request.currentUser.role)) return reply.code(403).send({ message: "Keine Berechtigung." });
  };
}
