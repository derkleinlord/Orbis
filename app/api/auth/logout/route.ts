import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.match(/(?:^|; )orbis_session=([^;]+)/)?.[1];
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
  return Response.json({ ok: true }, { headers: { "Set-Cookie": "orbis_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" } });
}
