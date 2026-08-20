import type { FastifyPluginAsync } from "fastify";
import type { RowDataPacket } from "mysql2";
import { getDb } from "../db/database.js";
import { requireRole } from "../middleware/auth.js";

export const userRoutes:FastifyPluginAsync=async app=>{app.get("/users",{preHandler:requireRole("Administrator")},async()=>{const[rows]=await getDb().query<RowDataPacket[]>("SELECT id,username,display_name AS displayName,role,status,created_at AS createdAt,last_login_at AS lastLoginAt FROM users ORDER BY display_name");return {users:rows};});};
