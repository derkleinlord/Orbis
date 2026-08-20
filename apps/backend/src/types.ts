import "@fastify/secure-session";

export type OrbisRole = "Administrator" | "Projektleiter" | "Mitglied" | "Gast";
export type SessionUser = { id: string; username: string; displayName: string; role: OrbisRole };

declare module "@fastify/secure-session" {
  interface SessionData { user: SessionUser }
}

declare module "fastify" {
  interface FastifyRequest { currentUser?: SessionUser }
}
