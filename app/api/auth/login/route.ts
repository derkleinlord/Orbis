import { env } from "cloudflare:workers";

type LoginUser = { id: number; username: string; display_name: string; password_hash: string; password_salt: string; role: string; status: string };

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, salt: string, expected: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", iterations: 210_000, salt: new TextEncoder().encode(salt) }, key, 256);
  const actual = hex(bits);
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i++) mismatch |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(request: Request) {
  const payload = await request.json() as { username?: string; password?: string };
  const username = payload.username?.trim().toLowerCase();
  if (!username || !payload.password) return Response.json({ error: "Benutzername und Passwort sind erforderlich." }, { status: 400 });
  const user = await env.DB.prepare("SELECT id, username, display_name, password_hash, password_salt, role, status FROM users WHERE username = ? LIMIT 1").bind(username).first<LoginUser>();
  if (!user || user.status !== "Aktiv" || !(await verifyPassword(payload.password, user.password_salt, user.password_hash))) {
    return Response.json({ error: "Benutzername oder Passwort ist nicht korrekt." }, { status: 401 });
  }
  const token = crypto.randomUUID() + crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 60 * 60 * 12;
  await env.DB.batch([
    env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").bind(token, user.id, expires, now),
    env.DB.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").bind(now, user.id),
  ]);
  return Response.json({ user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } }, { headers: { "Set-Cookie": `orbis_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` } });
}
