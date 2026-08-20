export type TableDefinition = { create: string; indexes?: string[] };

export const tables: TableDefinition[] = [
  { create: `CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY, username VARCHAR(80) NOT NULL UNIQUE, display_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, avatar_url TEXT NULL,
    role ENUM('Administrator','Projektleiter','Mitglied','Gast') NOT NULL DEFAULT 'Mitglied',
    status ENUM('Aktiv','Deaktiviert') NOT NULL DEFAULT 'Aktiv',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, last_login_at TIMESTAMP NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_users_status ON users(status)"] },
  { create: `CREATE TABLE IF NOT EXISTS projects (
    id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT NOT NULL,
    status ENUM('Geplant','Aktiv','Pausiert','Abgeschlossen','Archiviert') NOT NULL DEFAULT 'Aktiv',
    start_date DATE NOT NULL, end_date DATE NULL, lead_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_lead FOREIGN KEY (lead_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_projects_status ON projects(status)", "CREATE INDEX idx_projects_lead ON projects(lead_id)"] },
  { create: `CREATE TABLE IF NOT EXISTS project_members (
    project_id CHAR(36) NOT NULL, user_id CHAR(36) NOT NULL, project_role VARCHAR(80) NOT NULL DEFAULT 'Mitglied',
    PRIMARY KEY(project_id, user_id),
    CONSTRAINT fk_pm_project FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_project_members_user ON project_members(user_id)"] },
  { create: `CREATE TABLE IF NOT EXISTS tasks (
    id CHAR(36) PRIMARY KEY, project_id CHAR(36) NOT NULL, title VARCHAR(500) NOT NULL, description MEDIUMTEXT NOT NULL,
    status ENUM('Offen','In Bearbeitung','Blockiert','In Prüfung','Erledigt') NOT NULL DEFAULT 'Offen',
    priority ENUM('Niedrig','Normal','Hoch','Kritisch') NOT NULL DEFAULT 'Normal',
    assignee_id CHAR(36) NULL, creator_id CHAR(36) NOT NULL, start_date DATE NULL, due_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_project FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assignee FOREIGN KEY(assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_creator FOREIGN KEY(creator_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_tasks_project_status ON tasks(project_id,status)", "CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id,status)", "CREATE INDEX idx_tasks_due ON tasks(due_date)"] },
  { create: `CREATE TABLE IF NOT EXISTS comments (
    id CHAR(36) PRIMARY KEY, task_id CHAR(36) NOT NULL, author_id CHAR(36) NOT NULL, content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_task FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author FOREIGN KEY(author_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_comments_task_created ON comments(task_id,created_at)"] },
  { create: `CREATE TABLE IF NOT EXISTS document_folders (
    id CHAR(36) PRIMARY KEY, name VARCHAR(255) NOT NULL, project_id CHAR(36) NULL, parent_id CHAR(36) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_folders_project FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_folders_parent FOREIGN KEY(parent_id) REFERENCES document_folders(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_folders_parent ON document_folders(parent_id)"] },
  { create: `CREATE TABLE IF NOT EXISTS documents (
    id CHAR(36) PRIMARY KEY, folder_id CHAR(36) NULL, project_id CHAR(36) NULL, title VARCHAR(500) NOT NULL,
    content MEDIUMTEXT NOT NULL, author_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_folder FOREIGN KEY(folder_id) REFERENCES document_folders(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_project FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_author FOREIGN KEY(author_id) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_documents_folder ON documents(folder_id)", "CREATE INDEX idx_documents_project ON documents(project_id)"] },
  { create: `CREATE TABLE IF NOT EXISTS calendar_events (
    id CHAR(36) PRIMARY KEY, project_id CHAR(36) NULL, title VARCHAR(500) NOT NULL,
    type ENUM('Termin','Meilenstein') NOT NULL DEFAULT 'Termin', starts_at DATETIME NOT NULL, ends_at DATETIME NULL,
    created_by CHAR(36) NOT NULL, CONSTRAINT fk_events_project FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_events_creator FOREIGN KEY(created_by) REFERENCES users(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_events_start ON calendar_events(starts_at)"] },
  { create: `CREATE TABLE IF NOT EXISTS activities (
    id CHAR(36) PRIMARY KEY, actor_id CHAR(36) NOT NULL, project_id CHAR(36) NULL,
    entity_type VARCHAR(80) NOT NULL, entity_id CHAR(36) NULL, action VARCHAR(255) NOT NULL, details JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_actor FOREIGN KEY(actor_id) REFERENCES users(id),
    CONSTRAINT fk_activities_project FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`, indexes: ["CREATE INDEX idx_activities_project_created ON activities(project_id,created_at)", "CREATE INDEX idx_activities_actor_created ON activities(actor_id,created_at)"] }
];
