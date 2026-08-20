import bcrypt from "bcryptjs";
import type { FastifyPluginAsync } from "fastify";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { getDb } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import type { OrbisRole } from "../types.js";

type UserRow = RowDataPacket & { id:string;username:string;display_name:string;password_hash:string;role:OrbisRole;status:string };
const loginSchema=z.object({username:z.string().trim().min(1).max(80),password:z.string().min(1).max(500)});

export const authRoutes:FastifyPluginAsync=async app=>{
  app.post("/auth/login",async(request,reply)=>{
    const parsed=loginSchema.safeParse(request.body);
    if(!parsed.success)return reply.code(400).send({message:"Benutzername und Passwort sind erforderlich."});
    const[rows]=await getDb().query<UserRow[]>("SELECT id,username,display_name,password_hash,role,status FROM users WHERE username=? LIMIT 1",[parsed.data.username.toLowerCase()]);
    const user=rows[0];
    if(!user||user.status!=="Aktiv"||!(await bcrypt.compare(parsed.data.password,user.password_hash)))return reply.code(401).send({message:"Benutzername oder Passwort ist nicht korrekt."});
    const sessionUser={id:user.id,username:user.username,displayName:user.display_name,role:user.role};
    request.session.set("user",sessionUser);
    await getDb().query("UPDATE users SET last_login_at=CURRENT_TIMESTAMP WHERE id=?",[user.id]);
    return {user:sessionUser};
  });
  app.post("/auth/logout",{preHandler:requireAuth},async request=>{request.session.delete();return {ok:true};});
  app.get("/auth/me",{preHandler:requireAuth},async request=>({user:request.currentUser}));
};
