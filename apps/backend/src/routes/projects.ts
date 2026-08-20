import { randomUUID } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { getDb } from "../db/database.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const projectSchema=z.object({name:z.string().trim().min(2).max(255),description:z.string().max(10000).default(""),startDate:z.string(),endDate:z.string().nullable().optional()});
export const projectRoutes:FastifyPluginAsync=async app=>{
  app.get("/projects",{preHandler:requireAuth},async()=>{const[rows]=await getDb().query<RowDataPacket[]>(`SELECT p.id,p.name,p.description,p.status,p.start_date AS startDate,p.end_date AS endDate,p.created_at AS createdAt,u.display_name AS lead,COUNT(DISTINCT pm.user_id) AS members,COUNT(DISTINCT CASE WHEN t.status<>'Erledigt' THEN t.id END) AS openTasks FROM projects p JOIN users u ON u.id=p.lead_id LEFT JOIN project_members pm ON pm.project_id=p.id LEFT JOIN tasks t ON t.project_id=p.id WHERE p.status<>'Archiviert' GROUP BY p.id ORDER BY p.created_at DESC`);return {projects:rows};});
  app.post("/projects",{preHandler:requireRole("Administrator","Projektleiter")},async(request,reply)=>{const parsed=projectSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({message:"Ungültige Projektdaten."});const id=randomUUID();await getDb().query("INSERT INTO projects(id,name,description,start_date,end_date,lead_id) VALUES(?,?,?,?,?,?)",[id,parsed.data.name,parsed.data.description,parsed.data.startDate,parsed.data.endDate??null,request.currentUser!.id]);await getDb().query("INSERT INTO project_members(project_id,user_id,project_role) VALUES(?,?,'Projektleiter')",[id,request.currentUser!.id]);return reply.code(201).send({id});});
};
