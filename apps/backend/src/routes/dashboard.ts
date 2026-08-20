import type { FastifyPluginAsync } from "fastify";
import type { RowDataPacket } from "mysql2";
import { getDb } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRoutes:FastifyPluginAsync=async app=>{app.get("/dashboard",{preHandler:requireAuth},async request=>{const db=getDb();const[[projects],[tasks],[overdue],[done]]=await Promise.all([db.query<RowDataPacket[]>("SELECT COUNT(*) count FROM projects WHERE status='Aktiv'"),db.query<RowDataPacket[]>("SELECT COUNT(*) count FROM tasks WHERE assignee_id=? AND status<>'Erledigt'",[request.currentUser!.id]),db.query<RowDataPacket[]>("SELECT COUNT(*) count FROM tasks WHERE assignee_id=? AND status<>'Erledigt' AND due_date<CURDATE()",[request.currentUser!.id]),db.query<RowDataPacket[]>("SELECT COUNT(*) count FROM tasks WHERE assignee_id=? AND status='Erledigt'",[request.currentUser!.id])]);return {activeProjects:projects[0].count,openTasks:tasks[0].count,overdueTasks:overdue[0].count,completedTasks:done[0].count};});};
