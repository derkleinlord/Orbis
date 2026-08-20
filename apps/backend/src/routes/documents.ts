import type { FastifyPluginAsync } from "fastify";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { getDb } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";

export const documentRoutes:FastifyPluginAsync=async app=>{
  app.get("/documents",{preHandler:requireAuth},async()=>{const[rows]=await getDb().query<RowDataPacket[]>(`SELECT d.id,d.title,d.content,d.folder_id AS folderId,d.project_id AS projectId,d.updated_at AS updatedAt,u.display_name AS author,f.name AS folder FROM documents d JOIN users u ON u.id=d.author_id LEFT JOIN document_folders f ON f.id=d.folder_id ORDER BY d.updated_at DESC`);return {documents:rows};});
  app.patch("/documents/:id",{preHandler:requireAuth},async(request,reply)=>{const params=z.object({id:z.string().uuid()}).safeParse(request.params),body=z.object({title:z.string().trim().min(1).max(500),content:z.string().max(2_000_000)}).safeParse(request.body);if(!params.success||!body.success)return reply.code(400).send({message:"Ungültiges Dokument."});await getDb().query("UPDATE documents SET title=?,content=? WHERE id=?",[body.data.title,body.data.content,params.data.id]);return {ok:true};});
};
