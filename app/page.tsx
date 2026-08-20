"use client";

import {
  Archive,
  Bell,
  Bold,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code,
  FileText,
  Flag,
  Folder,
  FolderKanban,
  Grid3X3,
  Heading2,
  HelpCircle,
  Image,
  Italic,
  LayoutDashboard,
  Link2,
  List,
  ListTodo,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  Plus,
  Quote,
  Search,
  Settings,
  Sparkles,
  Sun,
  Table2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type View =
  | "dashboard"
  | "projects"
  | "tasks"
  | "docs"
  | "calendar"
  | "team"
  | "settings";
type TaskStatus =
  "Offen" | "In Bearbeitung" | "Blockiert" | "In Prüfung" | "Erledigt";
type Task = {
  id: number;
  title: string;
  project: string;
  status: TaskStatus;
  priority: string;
  due: string;
  assignee: string;
};

const projectData = [
  {
    name: "Website Relaunch",
    description: "Neuer digitaler Auftritt für DKL",
    meta: "12 offene Aufgaben",
    color: "#6f6af8",
    progress: 68,
    lead: "Lena Schmidt",
    members: 5,
  },
  {
    name: "Mobile App",
    description: "Konzeption und MVP der mobilen Anwendung",
    meta: "8 offene Aufgaben",
    color: "#e79556",
    progress: 42,
    lead: "Mara Klein",
    members: 4,
  },
  {
    name: "Interne Prozesse",
    description: "Abläufe vereinheitlichen und dokumentieren",
    meta: "5 offene Aufgaben",
    color: "#4b9d83",
    progress: 81,
    lead: "Dennis Lucking",
    members: 7,
  },
];
const initialTasks: Task[] = [
  {
    id: 1,
    title: "Navigationskonzept finalisieren",
    project: "Website Relaunch",
    status: "Offen",
    priority: "Hoch",
    due: "Heute",
    assignee: "LS",
  },
  {
    id: 2,
    title: "API-Endpunkte dokumentieren",
    project: "Mobile App",
    status: "In Bearbeitung",
    priority: "Normal",
    due: "Morgen",
    assignee: "MK",
  },
  {
    id: 3,
    title: "Onboarding-Checkliste prüfen",
    project: "Interne Prozesse",
    status: "In Prüfung",
    priority: "Normal",
    due: "23. Aug.",
    assignee: "DL",
  },
  {
    id: 4,
    title: "Hero-Visual abstimmen",
    project: "Website Relaunch",
    status: "Blockiert",
    priority: "Kritisch",
    due: "19. Aug.",
    assignee: "JS",
  },
  {
    id: 5,
    title: "Release-Notizen erstellen",
    project: "Mobile App",
    status: "Erledigt",
    priority: "Niedrig",
    due: "18. Aug.",
    assignee: "DL",
  },
  {
    id: 6,
    title: "Komponentenbibliothek aufsetzen",
    project: "Website Relaunch",
    status: "Offen",
    priority: "Hoch",
    due: "25. Aug.",
    assignee: "MK",
  },
];
const activity = [
  [
    "MK",
    "Mara Klein",
    "hat „API-Endpunkte dokumentieren“ in Bearbeitung verschoben",
    "vor 18 Min.",
  ],
  [
    "JS",
    "Jonas Seidel",
    "hat das Dokument „Designsystem“ bearbeitet",
    "vor 1 Std.",
  ],
  ["DL", "Du", "hast „Website Relaunch“ aktualisiert", "vor 3 Std."],
];
const statusColors: Record<TaskStatus, string> = {
  Offen: "#777b8e",
  "In Bearbeitung": "#4d82bc",
  Blockiert: "#df6d60",
  "In Prüfung": "#9b72c9",
  Erledigt: "#469978",
};

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false),
    [active, setActive] = useState<View>("dashboard"),
    [mobileOpen, setMobileOpen] = useState(false),
    [dark, setDark] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [taskModal, setTaskModal] = useState(false),
    [taskView, setTaskView] = useState<"list" | "board">("list"),
    [tasks, setTasks] = useState(initialTasks),
    [docTitle, setDocTitle] = useState("Designsystem"),
    [docContent, setDocContent] = useState(
      "Unser Designsystem schafft eine konsistente, ruhige Produkterfahrung. Es bündelt Farben, Typografie, Abstände und wiederverwendbare Komponenten an einem zentralen Ort.",
    ),
    [saved, setSaved] = useState(true),
    [loginError, setLoginError] = useState("");
  const nav = (view: View) => {
    setActive(view);
    setMobileOpen(false);
  };
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username"));
    const password = String(data.get("password"));
    if (location.hostname === "localhost" && username === "dennis" && password === "orbis2026") {
      setLoggedIn(true);
      setLoginError("");
      return;
    }
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const result = (await response.json()) as { error?: string };
    if (response.ok) { setLoggedIn(true); setLoginError(""); }
    else setLoginError(result.error ?? "Die Anmeldung ist momentan nicht möglich.");
  };
  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setTasks((t) => [
      {
        id: Date.now(),
        title: String(data.get("title")),
        project: String(data.get("project")),
        status: "Offen",
        priority: String(data.get("priority")),
        due: String(data.get("due") || "Ohne Termin"),
        assignee: "DL",
      },
      ...t,
    ]);
    setTaskModal(false);
    setActive("tasks");
  };
  const moveTask = (id: number, status: TaskStatus) =>
    setTasks((list) =>
      list.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  if (!loggedIn)
    return (
      <Login
        onSubmit={handleLogin}
        error={loginError}
        dark={dark}
        toggleTheme={() => setDark(!dark)}
      />
    );
  return (
    <main className={`app-shell ${dark ? "dark" : ""}`}>
      <Sidebar
        active={active}
        nav={nav}
        open={mobileOpen}
        close={() => setMobileOpen(false)}
        logout={() => { void fetch("/api/auth/logout", { method: "POST" }); setLoggedIn(false); }}
      />
      {mobileOpen && (
        <button
          className="backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Menü schließen"
        />
      )}
      <section className="workspace">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Navigation öffnen"
          >
            <Menu />
          </button>
          <button className="search" onClick={() => setSearchOpen(true)}>
            <Search />
            <span>In Orbis suchen …</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="top-actions">
            <button aria-label="Neuigkeiten">
              <Sparkles />
            </button>
            <button className="notification" aria-label="Benachrichtigungen">
              <Bell />
              <i />
            </button>
            <button className="avatar">DL</button>
          </div>
        </header>
        {active === "dashboard" && (
          <Dashboard
            tasks={tasks}
            newTask={() => setTaskModal(true)}
            nav={nav}
          />
        )}
        {active === "projects" && (
          <Projects newTask={() => setTaskModal(true)} />
        )}
        {active === "tasks" && (
          <Tasks
            tasks={tasks}
            view={taskView}
            setView={setTaskView}
            newTask={() => setTaskModal(true)}
            moveTask={moveTask}
          />
        )}
        {active === "docs" && (
          <Docs
            title={docTitle}
            setTitle={setDocTitle}
            content={docContent}
            changeContent={(value) => {
              setDocContent(value);
              setSaved(false);
              window.setTimeout(() => setSaved(true), 700);
            }}
            saved={saved}
          />
        )}
        {active === "calendar" && <Calendar tasks={tasks} />}
        {active === "team" && <Team />}
        {active === "settings" && (
          <SettingsView dark={dark} setDark={setDark} />
        )}
      </section>
      {searchOpen && (
        <SearchOverlay close={() => setSearchOpen(false)} nav={nav} />
      )}
      {taskModal && (
        <TaskModal close={() => setTaskModal(false)} submit={addTask} />
      )}
    </main>
  );
}

function Login({
  onSubmit,
  error,
  dark,
  toggleTheme,
}: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error: string;
  dark: boolean;
  toggleTheme: () => void;
}) {
  return (
    <main className={`login-page ${dark ? "dark" : ""}`}>
      <button
        className="theme-float"
        onClick={toggleTheme}
        aria-label="Darstellung wechseln"
      >
        {dark ? <Sun /> : <Moon />}
      </button>
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-mark">
            <span />
          </span>
          <strong>orbis</strong>
        </div>
        <p className="login-kicker">WILLKOMMEN ZURÜCK</p>
        <h1>Bei Orbis anmelden</h1>
        <p className="login-sub">Projekte, Aufgaben und Wissen an einem Ort.</p>
        <form onSubmit={onSubmit}>
          <label>
            Benutzername
            <input
              name="username"
              autoComplete="username"
              defaultValue="dennis"
              required
            />
          </label>
          <label>
            Passwort
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="orbis2026"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="login-button" type="submit">
            Anmelden <span>→</span>
          </button>
        </form>
        <div className="demo-hint">
          <Sparkles />
          Demo-Zugang ist bereits eingetragen.
        </div>
      </section>
      <aside className="login-visual">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <blockquote>
          „Alles, was unser Team braucht – ohne den Lärm.“
          <small>Orbis Workspace</small>
        </blockquote>
      </aside>
    </main>
  );
}

function Sidebar({
  active,
  nav,
  open,
  close,
  logout,
}: {
  active: View;
  nav: (v: View) => void;
  open: boolean;
  close: () => void;
  logout: () => void;
}) {
  const items: [[View, string, typeof LayoutDashboard], string?][] = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["projects", "Projekte", FolderKanban],
    ["tasks", "Meine Aufgaben", ListTodo],
    ["docs", "Dokumentation", BookOpen],
    ["calendar", "Kalender", CalendarDays],
    ["team", "Team", Users],
  ];
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <span className="brand-mark">
          <span />
        </span>
        <strong>orbis</strong>
        <button
          className="mobile-close"
          onClick={close}
          aria-label="Menü schließen"
        >
          <X />
        </button>
      </div>
      <nav className="nav-main">
        {items.map(([view, label, Icon]) => (
          <button
            key={view}
            onClick={() => nav(view)}
            className={`nav-item ${active === view ? "active" : ""}`}
          >
            <Icon />
            {label}
            {view === "tasks" && <span className="nav-count">7</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-section">
        <p>PROJEKTE</p>
        {projectData.map((p) => (
          <button
            className="project-link"
            onClick={() => nav("projects")}
            key={p.name}
          >
            <i style={{ background: p.color }} />
            {p.name}
          </button>
        ))}
        <button className="add-project">
          <Plus />
          Projekt hinzufügen
        </button>
      </div>
      <div className="sidebar-bottom">
        <button className="nav-item">
          <HelpCircle />
          Hilfe & Support
        </button>
        <button
          onClick={() => nav("settings")}
          className={`nav-item ${active === "settings" ? "active" : ""}`}
        >
          <Settings />
          Einstellungen
        </button>
        <div className="profile">
          <span className="avatar avatar-photo">DL</span>
          <div>
            <strong>Dennis Lucking</strong>
            <small>Administrator</small>
          </div>
          <button onClick={logout} aria-label="Abmelden">
            <LogOut />
          </button>
        </div>
      </div>
    </aside>
  );
}

function PageHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="welcome">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </section>
  );
}

function Dashboard({
  tasks,
  newTask,
  nav,
}: {
  tasks: Task[];
  newTask: () => void;
  nav: (v: View) => void;
}) {
  return (
    <div className="content">
      <PageHead
        eyebrow="DONNERSTAG, 20. AUGUST"
        title="Guten Morgen, Dennis."
        sub="Hier ist dein Überblick für heute."
        action={
          <button className="primary-button" onClick={newTask}>
            <Plus />
            Neue Aufgabe
          </button>
        }
      />
      <section className="stats-grid">
        <Stat
          icon={<FolderKanban />}
          tone="purple"
          label="Aktive Projekte"
          value="6"
          info="+1 diesen Monat"
        />
        <Stat
          icon={<ListTodo />}
          tone="blue"
          label="Meine Aufgaben"
          value={String(tasks.length)}
          info={`${tasks.filter((t) => t.status !== "Erledigt").length} davon offen`}
        />
        <Stat
          icon={<Clock3 />}
          tone="coral"
          label="Überfällig"
          value="3"
          info="Benötigen Aufmerksamkeit"
        />
        <Stat
          icon={<CheckCircle2 />}
          tone="green"
          label="Erledigt"
          value="28"
          info="+12% diese Woche"
        />
      </section>
      <section className="dashboard-grid">
        <article className="panel task-panel">
          <PanelHead
            title="Meine Aufgaben"
            sub="Deine nächsten offenen Aufgaben"
            link="Alle anzeigen"
            onClick={() => nav("tasks")}
          />
          <div className="task-list">
            {tasks.slice(0, 3).map((task, index) => (
              <div className="task-row" key={task.id}>
                <button className="task-check" aria-label="Erledigen" />
                <div className="task-copy">
                  <strong>{task.title}</strong>
                  <span>
                    <i style={{ background: projectData[index % 3].color }} />
                    {task.project}
                  </span>
                </div>
                <span className={`due ${task.due === "Heute" ? "urgent" : ""}`}>
                  <CalendarDays />
                  {task.due}
                </span>
                <span className={`avatar avatar-${index}`}>
                  {task.assignee}
                </span>
                <MoreHorizontal className="row-more" />
              </div>
            ))}
          </div>
        </article>
        <article className="panel activity-panel">
          <PanelHead
            title="Letzte Aktivitäten"
            sub="Was sich in deinem Team getan hat"
          />
          <div className="activity-list">
            {activity.map((item, index) => (
              <div className="activity-row" key={item[2]}>
                <span className={`avatar avatar-${index + 1}`}>{item[0]}</span>
                <p>
                  <strong>{item[1]}</strong> {item[2]}
                  <small>{item[3]}</small>
                </p>
              </div>
            ))}
          </div>
          <button className="activity-link">Alle Aktivitäten anzeigen</button>
        </article>
      </section>
      <section className="lower-grid">
        <article className="panel projects-panel">
          <PanelHead
            title="Aktive Projekte"
            sub="Fortschritt deiner wichtigsten Projekte"
            link="Alle Projekte"
            onClick={() => nav("projects")}
          />
          <div className="project-cards">
            {projectData.map((p, i) => (
              <div className="project-card" key={p.name}>
                <div>
                  <span
                    className="project-symbol"
                    style={{ background: p.color }}
                  >
                    {p.name[0]}
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.meta}</small>
                  </span>
                </div>
                <p>
                  <span>Fortschritt</span>
                  <b>{p.progress}%</b>
                </p>
                <div className="progress">
                  <i style={{ width: `${p.progress}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="panel dates-panel">
          <PanelHead
            title="Kommende Termine"
            sub="In den nächsten 7 Tagen"
            link="Kalender"
            onClick={() => nav("calendar")}
          />
          <DateItem
            day="21"
            title="Relaunch Kickoff"
            meta="09:30 · Website Relaunch"
          />
          <DateItem day="24" title="Sprint Review" meta="14:00 · Mobile App" />
        </article>
      </section>
    </div>
  );
}

function Projects({ newTask }: { newTask: () => void }) {
  return (
    <div className="content">
      <PageHead
        eyebrow="PROJEKTE"
        title="Gemeinsam vorankommen."
        sub="Alle aktiven Vorhaben, Zuständigkeiten und Fortschritte."
        action={
          <button className="primary-button">
            <Plus />
            Neues Projekt
          </button>
        }
      />
      <div className="filterbar">
        <button className="filter-active">
          Aktiv <span>6</span>
        </button>
        <button>Archiviert</button>
        <span />
        <button>
          <Grid3X3 />
          Kacheln
        </button>
      </div>
      <section className="project-grid-large">
        {projectData.map((p, i) => (
          <article className="project-tile" key={p.name}>
            <header>
              <span
                className="project-symbol big"
                style={{ background: p.color }}
              >
                {p.name[0]}
              </span>
              <button>
                <MoreHorizontal />
              </button>
            </header>
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            <div className="project-stats">
              <span>
                <ListTodo />
                {p.meta}
              </span>
              <span>
                <Users />
                {p.members} Mitglieder
              </span>
            </div>
            <div className="progress-copy">
              <span>Projektfortschritt</span>
              <b>{p.progress}%</b>
            </div>
            <div className="progress">
              <i style={{ width: `${p.progress}%`, background: p.color }} />
            </div>
            <footer>
              <span className={`avatar avatar-${i}`}>
                {["LS", "MK", "DL"][i]}
              </span>
              <small>
                Leitung: <b>{p.lead}</b>
              </small>
              <button onClick={newTask}>
                <Plus />
                Aufgabe
              </button>
            </footer>
          </article>
        ))}
      </section>
    </div>
  );
}

function Tasks({
  tasks,
  view,
  setView,
  newTask,
  moveTask,
}: {
  tasks: Task[];
  view: "list" | "board";
  setView: (v: "list" | "board") => void;
  newTask: () => void;
  moveTask: (id: number, s: TaskStatus) => void;
}) {
  const cols: TaskStatus[] = [
    "Offen",
    "In Bearbeitung",
    "Blockiert",
    "In Prüfung",
    "Erledigt",
  ];
  return (
    <div className="content wide">
      <PageHead
        eyebrow="MEINE AUFGABEN"
        title="Fokus auf das Wesentliche."
        sub={`${tasks.filter((t) => t.status !== "Erledigt").length} offene Aufgaben über 3 Projekte.`}
        action={
          <button className="primary-button" onClick={newTask}>
            <Plus />
            Neue Aufgabe
          </button>
        }
      />
      <div className="tasks-toolbar">
        <div>
          <button
            className={view === "list" ? "selected" : ""}
            onClick={() => setView("list")}
          >
            <List />
            Liste
          </button>
          <button
            className={view === "board" ? "selected" : ""}
            onClick={() => setView("board")}
          >
            <Grid3X3 />
            Board
          </button>
        </div>
        <div>
          <button>
            <Flag />
            Alle Prioritäten
          </button>
          <button>
            <FolderKanban />
            Alle Projekte
          </button>
        </div>
      </div>
      {view === "list" ? (
        <div className="task-table panel">
          <div className="task-table-head">
            <span>Aufgabe</span>
            <span>Status</span>
            <span>Priorität</span>
            <span>Fällig</span>
            <span>Person</span>
          </div>
          {tasks.map((t) => (
            <div className="task-table-row" key={t.id}>
              <span>
                <button
                  className="task-check"
                  onClick={() => moveTask(t.id, "Erledigt")}
                />
                <b>{t.title}</b>
                <small>{t.project}</small>
              </span>
              <span>
                <i style={{ background: statusColors[t.status] }} />
                {t.status}
              </span>
              <span className={`priority p-${t.priority.toLowerCase()}`}>
                {t.priority}
              </span>
              <span className={t.due.includes("19.") ? "late" : ""}>
                {t.due}
              </span>
              <span className="avatar">{t.assignee}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="board">
          {cols.map((col) => (
            <section
              className="board-column"
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) =>
                moveTask(Number(e.dataTransfer.getData("text")), col)
              }
            >
              <header>
                <span style={{ background: statusColors[col] }} />
                <strong>{col}</strong>
                <b>{tasks.filter((t) => t.status === col).length}</b>
                <Plus />
              </header>
              {tasks
                .filter((t) => t.status === col)
                .map((t) => (
                  <article
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text", String(t.id))
                    }
                    className="kanban-card"
                    key={t.id}
                  >
                    <span className={`priority p-${t.priority.toLowerCase()}`}>
                      {t.priority}
                    </span>
                    <h3>{t.title}</h3>
                    <p>
                      <i
                        style={{
                          background: projectData.find(
                            (p) => p.name === t.project,
                          )?.color,
                        }}
                      />
                      {t.project}
                    </p>
                    <footer>
                      <span>
                        <CalendarDays />
                        {t.due}
                      </span>
                      <span className="avatar">{t.assignee}</span>
                    </footer>
                  </article>
                ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Docs({
  title,
  setTitle,
  content,
  changeContent,
  saved,
}: {
  title: string;
  setTitle: (v: string) => void;
  content: string;
  changeContent: (v: string) => void;
  saved: boolean;
}) {
  return (
    <div className="docs-layout">
      <aside className="docs-tree">
        <div className="docs-tree-head">
          <span>
            <BookOpen />
            Dokumentation
          </span>
          <button>
            <Plus />
          </button>
        </div>
        <button className="tree-folder">
          <ChevronDown />
          <Folder />
          Allgemein
        </button>
        <button className="tree-doc">
          <FileText />
          Willkommen bei Orbis
        </button>
        <button className="tree-doc active">
          <FileText />
          Designsystem
        </button>
        <button className="tree-folder">
          <ChevronDown />
          <Folder />
          Website Relaunch
        </button>
        <button className="tree-doc">
          <FileText />
          Projektübersicht
        </button>
        <button className="tree-sub">
          <ChevronDown />
          <Folder />
          Entwicklung
        </button>
        <button className="tree-doc indent">
          <FileText />
          Frontend
        </button>
        <button className="tree-doc indent">
          <FileText />
          Backend
        </button>
      </aside>
      <article className="doc-editor">
        <header>
          <div>
            <span>Allgemein</span>
            <ChevronRight />
            <span>{title}</span>
          </div>
          <p>
            <span className={saved ? "saved" : "saving"}>
              {saved ? <Check /> : <Clock3 />}
              {saved ? "Gespeichert" : "Speichert …"}
            </span>
            <button>
              <Users />
              Teilen
            </button>
            <button>
              <MoreHorizontal />
            </button>
          </p>
        </header>
        <div className="editor-toolbar">
          {[
            Heading2,
            Bold,
            Italic,
            List,
            ListTodo,
            Quote,
            Code,
            Table2,
            Link2,
            Image,
          ].map((Icon, i) => (
            <button key={i}>
              <Icon />
            </button>
          ))}
        </div>
        <div className="editor-canvas">
          <input
            className="doc-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              changeContent(content);
            }}
          />
          <p className="doc-meta">
            <span className="avatar">JS</span> Zuletzt bearbeitet von Jonas ·
            vor 1 Stunde
          </p>
          <textarea
            aria-label="Dokumentinhalt"
            value={content}
            onChange={(e) => changeContent(e.target.value)}
          />
          <h2>Grundprinzipien</h2>
          <div className="principles">
            <span>
              <b>01</b>
              <strong>Klarheit vor Dekoration</strong>
              <small>Jedes Element erfüllt eine Aufgabe.</small>
            </span>
            <span>
              <b>02</b>
              <strong>Ruhige Hierarchie</strong>
              <small>Inhalte führen den Blick.</small>
            </span>
            <span>
              <b>03</b>
              <strong>Konsistenz</strong>
              <small>Bekannte Muster schaffen Tempo.</small>
            </span>
          </div>
          <blockquote>
            Ein gutes Interface fühlt sich selbstverständlich an.
          </blockquote>
        </div>
      </article>
    </div>
  );
}

function Calendar({ tasks }: { tasks: Task[] }) {
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  return (
    <div className="content">
      <PageHead
        eyebrow="KALENDER"
        title="August 2026"
        sub="Aufgaben, Meilensteine und Projekttermine."
        action={
          <button className="primary-button">
            <Plus />
            Neuer Termin
          </button>
        }
      />
      <div className="calendar-tools">
        <div>
          <button>‹</button>
          <button>Heute</button>
          <button>›</button>
        </div>
        <div>
          <button className="selected">Monat</button>
          <button>Woche</button>
          <button>Liste</button>
        </div>
      </div>
      <section className="month panel">
        <header>
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </header>
        <div className="month-grid">
          {days.map((day, i) => (
            <div
              className={`${day < 1 ? "muted-day" : ""} ${day === 20 ? "today" : ""}`}
              key={i}
            >
              <b>{day < 1 ? 29 + day : day}</b>
              {day === 3 && <Event color="#6f6af8" text="Projekt Kickoff" />}
              {day === 11 && <Event color="#e79556" text="Sprint Planung" />}
              {day === 20 && <Event color="#df6d60" text="Navigation fällig" />}
              {day === 21 && <Event color="#6f6af8" text="Relaunch Kickoff" />}
              {day === 24 && <Event color="#e79556" text="Sprint Review" />}
              {day === 27 && <Event color="#4b9d83" text="Prozess Workshop" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Team() {
  const people = [
    ["DL", "Dennis Lucking", "Administrator", "Aktiv"],
    ["LS", "Lena Schmidt", "Projektleiter", "Aktiv"],
    ["MK", "Mara Klein", "Mitglied", "Aktiv"],
    ["JS", "Jonas Seidel", "Mitglied", "Aktiv"],
    ["AW", "Anna Weber", "Gast", "Deaktiviert"],
  ];
  return (
    <div className="content">
      <PageHead
        eyebrow="ADMINISTRATION"
        title="Team & Benutzer"
        sub="Konten, Rollen und Zugriffe zentral verwalten."
        action={
          <button className="primary-button">
            <Plus />
            Benutzer erstellen
          </button>
        }
      />
      <div className="team-summary">
        <span>
          <Users />
          <b>12</b>
          <small>Benutzer gesamt</small>
        </span>
        <span>
          <CheckCircle2 />
          <b>11</b>
          <small>Aktive Konten</small>
        </span>
        <span>
          <UserCog />
          <b>4</b>
          <small>Rollen</small>
        </span>
      </div>
      <div className="team-table panel">
        <div className="team-head">
          <b>Benutzer</b>
          <span>Rolle</span>
          <span>Status</span>
          <span>Letzter Login</span>
          <span />
        </div>
        {people.map((p, i) => (
          <div className="team-row" key={p[1]}>
            <b>
              <span className={`avatar avatar-${i % 4}`}>{p[0]}</span>
              <span>
                {p[1]}
                <small>@{p[1].toLowerCase().replace(" ", ".")}</small>
              </span>
            </b>
            <span>{p[2]}</span>
            <span
              className={`user-status ${p[3] !== "Aktiv" ? "inactive" : ""}`}
            >
              <i />
              {p[3]}
            </span>
            <span>{i === 0 ? "Gerade eben" : `${i + 1} Std.`}</span>
            <button>
              <MoreHorizontal />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({
  dark,
  setDark,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  return (
    <div className="content settings-content">
      <PageHead
        eyebrow="EINSTELLUNGEN"
        title="Dein Orbis."
        sub="Profil, Sicherheit und persönliche Darstellung."
      />
      <section className="settings-grid">
        <aside className="settings-nav">
          <button className="active">
            <Users />
            Profil
          </button>
          <button>
            <Settings />
            Sicherheit
          </button>
          <button>
            <Moon />
            Darstellung
          </button>
        </aside>
        <article className="settings-card panel">
          <h2>Profil</h2>
          <p>So wirst du für andere in Orbis angezeigt.</p>
          <div className="profile-edit">
            <span className="avatar avatar-photo">DL</span>
            <button>Profilbild ändern</button>
            <button className="text-danger">Entfernen</button>
          </div>
          <label>
            Anzeigename
            <input defaultValue="Dennis Lucking" />
          </label>
          <label>
            Benutzername
            <input defaultValue="dennis" disabled />
            <small>Nur Administratoren können den Benutzernamen ändern.</small>
          </label>
          <hr />
          <h2>Darstellung</h2>
          <p>Wähle die Oberfläche, die zu dir passt.</p>
          <div className="theme-options">
            <button
              className={!dark ? "active" : ""}
              onClick={() => setDark(false)}
            >
              <span className="theme-preview light-preview" />
              <b>
                <Sun />
                Hell
              </b>
            </button>
            <button
              className={dark ? "active" : ""}
              onClick={() => setDark(true)}
            >
              <span className="theme-preview dark-preview" />
              <b>
                <Moon />
                Dunkel
              </b>
            </button>
          </div>
          <footer>
            <button className="primary-button">Änderungen speichern</button>
          </footer>
        </article>
      </section>
    </div>
  );
}

function SearchOverlay({
  close,
  nav,
}: {
  close: () => void;
  nav: (v: View) => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section
        className="search-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header>
          <Search />
          <input
            autoFocus
            placeholder="Projekte, Aufgaben, Dokumente und Benutzer suchen …"
          />
          <kbd>ESC</kbd>
        </header>
        <div>
          <p>ZULETZT GESUCHT</p>
          <button
            onClick={() => {
              nav("projects");
              close();
            }}
          >
            <FolderKanban />
            <span>
              <b>Website Relaunch</b>
              <small>Projekt · Aktiv</small>
            </span>
            <ChevronRight />
          </button>
          <button
            onClick={() => {
              nav("docs");
              close();
            }}
          >
            <FileText />
            <span>
              <b>Designsystem</b>
              <small>Dokument · Allgemein</small>
            </span>
            <ChevronRight />
          </button>
          <button
            onClick={() => {
              nav("tasks");
              close();
            }}
          >
            <ListTodo />
            <span>
              <b>API-Endpunkte dokumentieren</b>
              <small>Aufgabe · Mobile App</small>
            </span>
            <ChevronRight />
          </button>
        </div>
        <footer>
          <span>↑↓ Navigieren</span>
          <span>↵ Öffnen</span>
          <span>ESC Schließen</span>
        </footer>
      </section>
    </div>
  );
}

function TaskModal({
  close,
  submit,
}: {
  close: () => void;
  submit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <form
        className="form-modal"
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header>
          <div>
            <h2>Neue Aufgabe</h2>
            <p>Erstelle eine Aufgabe und weise sie direkt zu.</p>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </header>
        <label>
          Titel
          <input
            name="title"
            placeholder="Was muss erledigt werden?"
            autoFocus
            required
          />
        </label>
        <div className="form-two">
          <label>
            Projekt
            <select name="project">
              {projectData.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            Priorität
            <select name="priority">
              <option>Normal</option>
              <option>Hoch</option>
              <option>Kritisch</option>
              <option>Niedrig</option>
            </select>
          </label>
        </div>
        <label>
          Fälligkeitsdatum
          <input name="due" type="date" />
        </label>
        <label>
          Beschreibung
          <textarea
            name="description"
            placeholder="Kontext, Ziel und Hinweise …"
          />
        </label>
        <footer>
          <button type="button" onClick={close}>
            Abbrechen
          </button>
          <button className="primary-button" type="submit">
            Aufgabe erstellen
          </button>
        </footer>
      </form>
    </div>
  );
}

function Stat({
  icon,
  tone,
  label,
  value,
  info,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: string;
  info: string;
}) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{info}</small>
      </div>
      <MoreHorizontal />
    </article>
  );
}
function PanelHead({
  title,
  sub,
  link,
  onClick,
}: {
  title: string;
  sub: string;
  link?: string;
  onClick?: () => void;
}) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {link ? (
        <button onClick={onClick}>
          {link} <span>→</span>
        </button>
      ) : (
        <MoreHorizontal />
      )}
    </div>
  );
}
function DateItem({
  day,
  title,
  meta,
}: {
  day: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="date-item">
      <span>
        <b>{day}</b>AUG
      </span>
      <div>
        <strong>{title}</strong>
        <p>{meta}</p>
      </div>
    </div>
  );
}
function Event({ color, text }: { color: string; text: string }) {
  return (
    <span
      className="calendar-event"
      style={{ borderColor: color, background: `${color}14`, color }}
    >
      {text}
    </span>
  );
}
