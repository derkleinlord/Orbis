import bcrypt from "bcryptjs";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { tables } from "./schema.js";

let pool: Pool | undefined;
export function getDb(): Pool { if (!pool) throw new Error("MariaDB wurde noch nicht initialisiert."); return pool; }

async function seedDatabase(db: Pool) {
  const [users] = await db.query<RowDataPacket[]>("SELECT id FROM users LIMIT 1");
  if (users.length) return;
  const adminId = randomUUID();
  const projectIds = [randomUUID(), randomUUID(), randomUUID()];
  const passwordHash = await bcrypt.hash(env.BOOTSTRAP_ADMIN_PASSWORD, 12);
  await db.query("INSERT INTO users (id,username,display_name,password_hash,role,status) VALUES (?,?,?,?, 'Administrator','Aktiv')", [adminId, env.BOOTSTRAP_ADMIN_USERNAME.toLowerCase(), env.BOOTSTRAP_ADMIN_DISPLAY_NAME, passwordHash]);
  const projects = [
    [projectIds[0], "Website Relaunch", "Neuer digitaler Auftritt für DKL", "2026-08-01"],
    [projectIds[1], "Mobile App", "Konzeption und MVP der mobilen Anwendung", "2026-08-10"],
    [projectIds[2], "Interne Prozesse", "Abläufe vereinheitlichen und dokumentieren", "2026-07-15"]
  ];
  for (const project of projects) {
    await db.query("INSERT INTO projects (id,name,description,status,start_date,lead_id) VALUES (?,?,?,'Aktiv',?,?)", [...project, adminId]);
    await db.query("INSERT INTO project_members (project_id,user_id,project_role) VALUES (?,?,'Projektleiter')", [project[0], adminId]);
  }
  const tasks = [
    [projectIds[0], "Navigationskonzept finalisieren", "Offen", "Hoch", "2026-08-20"],
    [projectIds[1], "API-Endpunkte dokumentieren", "In Bearbeitung", "Normal", "2026-08-21"],
    [projectIds[2], "Onboarding-Checkliste prüfen", "In Prüfung", "Normal", "2026-08-23"],
    [projectIds[0], "Hero-Visual abstimmen", "Blockiert", "Kritisch", "2026-08-19"],
    [projectIds[1], "Release-Notizen erstellen", "Erledigt", "Niedrig", "2026-08-18"],
    [projectIds[0], "Komponentenbibliothek aufsetzen", "Offen", "Hoch", "2026-08-25"]
  ];
  for (const [projectId,title,status,priority,dueDate] of tasks) await db.query("INSERT INTO tasks (id,project_id,title,description,status,priority,assignee_id,creator_id,due_date) VALUES (?,?,?,'',?,?,?,?,?)", [randomUUID(),projectId,title,status,priority,adminId,adminId,dueDate]);
  const folderId = randomUUID();
  await db.query("INSERT INTO document_folders (id,name) VALUES (?,'Allgemein')", [folderId]);
  await db.query("INSERT INTO documents (id,folder_id,title,content,author_id) VALUES (?,?, 'Designsystem', ?, ?)", [randomUUID(), folderId, "Unser Designsystem schafft eine konsistente, ruhige Produkterfahrung.", adminId]);
}

export async function initializeDatabase() {
  const connection = await mysql.createConnection({ host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASSWORD });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } catch (error) {
    const code=(error as {code?:string}).code;
    if (code!=="ER_DBACCESS_DENIED_ERROR" && code!=="ER_ACCESS_DENIED_ERROR") throw error;
  } finally { await connection.end(); }
  pool = mysql.createPool({ host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB_DATABASE, connectionLimit: env.DB_CONNECTION_LIMIT, waitForConnections: true, charset: "utf8mb4" });
  for (const table of tables) {
    await pool.query(table.create);
    for (const statement of table.indexes ?? []) {
      try { await pool.query(statement); } catch (error) { if ((error as { code?: string }).code !== "ER_DUP_KEYNAME") throw error; }
    }
  }
  await seedDatabase(pool);
}
