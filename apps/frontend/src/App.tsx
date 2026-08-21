import {
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
import { FormEvent, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

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
  id: string;
  projectId?: string;
  title: string;
  project: string;
  status: TaskStatus;
  priority: string;
  due: string;
  assignee: string;
};
type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string | null;
  lead: string;
  members: number;
  openTasks: number;
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
    id: "demo-1",
    title: "Navigationskonzept finalisieren",
    project: "Website Relaunch",
    status: "Offen",
    priority: "Hoch",
    due: "Heute",
    assignee: "LS",
  },
  {
    id: "demo-2",
    title: "API-Endpunkte dokumentieren",
    project: "Mobile App",
    status: "In Bearbeitung",
    priority: "Normal",
    due: "Morgen",
    assignee: "MK",
  },
  {
    id: "demo-3",
    title: "Onboarding-Checkliste prüfen",
    project: "Interne Prozesse",
    status: "In Prüfung",
    priority: "Normal",
    due: "23. Aug.",
    assignee: "DL",
  },
  {
    id: "demo-4",
    title: "Hero-Visual abstimmen",
    project: "Website Relaunch",
    status: "Blockiert",
    priority: "Kritisch",
    due: "19. Aug.",
    assignee: "JS",
  },
  {
    id: "demo-5",
    title: "Release-Notizen erstellen",
    project: "Mobile App",
    status: "Erledigt",
    priority: "Niedrig",
    due: "18. Aug.",
    assignee: "DL",
  },
  {
    id: "demo-6",
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
const projectColors = ["#6f6af8", "#e79556", "#4b9d83", "#4d82bc", "#9b72c9", "#df6d60"];
const initials = (name: string | null) => name ? name.split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase() : "–";
const formatDueDate = (date: string | null) => date ? new Intl.DateTimeFormat("de-DE",{day:"2-digit",month:"short"}).format(new Date(`${date}T12:00:00`)) : "Ohne Termin";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false),
    [sessionChecked, setSessionChecked] = useState(false),
    [active, setActive] = useState<View>("dashboard"),
    [mobileOpen, setMobileOpen] = useState(false),
    [dark, setDark] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [taskModal, setTaskModal] = useState(false),
    [taskModalProjectId, setTaskModalProjectId] = useState<string | null>(null),
    [projectModal, setProjectModal] = useState(false),
    [taskView, setTaskView] = useState<"list" | "board">("list"),
    [tasks, setTasks] = useState(initialTasks),
    [projectTasks, setProjectTasks] = useState(initialTasks),
    [projects, setProjects] = useState<Project[]>([]),
    [selectedProjectId, setSelectedProjectId] = useState<string | null>(null),
    [docTitle, setDocTitle] = useState("Designsystem"),
    [docContent, setDocContent] = useState(
      "Unser Designsystem schafft eine konsistente, ruhige Produkterfahrung. Es bündelt Farben, Typografie, Abstände und wiederverwendbare Komponenten an einem zentralen Ort.",
    ),
    [saved, setSaved] = useState(true),
    [loginError, setLoginError] = useState("");
  useEffect(() => {
    void fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then(response => setLoggedIn(response.ok))
      .catch(() => setLoggedIn(false))
      .finally(() => setSessionChecked(true));
  }, []);
  useEffect(() => {
    if (!loggedIn) return;
    const request = <T,>(path: string) => fetch(`${API_URL}${path}`, { credentials: "include" }).then(async response => {
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json() as Promise<T>;
    });
    const mapTasks = (items: Array<{ id:string;projectId:string;title:string;project:string;status:TaskStatus;priority:string;dueDate:string|null;assigneeName:string|null }>): Task[] => items.map(task => ({ id:task.id,projectId:task.projectId,title:task.title,project:task.project,status:task.status,priority:task.priority,due:formatDueDate(task.dueDate),assignee:initials(task.assigneeName) }));
    void request<{projects: Project[]}>("/projects").then(result => {
      setProjects(result.projects.map(project => ({...project,members:Number(project.members),openTasks:Number(project.openTasks)})));
    }).catch(() => setLoginError("Die Projekte konnten nicht geladen werden."));
    void request<{tasks: Parameters<typeof mapTasks>[0]}>("/tasks?mine=true").then(result => setTasks(mapTasks(result.tasks)));
    void request<{tasks: Parameters<typeof mapTasks>[0]}>("/tasks").then(result => setProjectTasks(mapTasks(result.tasks)));
    void request<{documents: Array<{title:string;content:string}>}>("/documents").then(result => {
      if (result.documents[0]) { setDocTitle(result.documents[0].title); setDocContent(result.documents[0].content); }
    });
  }, [loggedIn]);
  const nav = (view: View) => {
    setActive(view);
    setMobileOpen(false);
  };
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username"));
    const password = String(data.get("password"));
    try {
      const response = await fetch(`${API_URL}/auth/login`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const result = (await response.json()) as { message?: string };
      if (response.ok) { setLoggedIn(true); setLoginError(""); }
      else setLoginError(result.message ?? "Die Anmeldung ist momentan nicht möglich.");
    } catch {
      setLoginError("Der Server ist momentan nicht erreichbar.");
    }
  };
  const addTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const projectId=String(data.get("project")), title=String(data.get("title")), priority=String(data.get("priority")), dueDate=String(data.get("due")||"")||null, description=String(data.get("description")||"");
    const project=projects.find(item=>item.id===projectId);
    const response=await fetch(`${API_URL}/tasks`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,projectId,priority,dueDate,description})});
    const result=(await response.json()) as {id?:string};
    if(!response.ok||!result.id){setLoginError("Die Aufgabe konnte nicht gespeichert werden.");return;}
    if(!project){setLoginError("Das ausgewählte Projekt wurde nicht gefunden.");return;}
    const createdTask={id:result.id!,projectId,title,project:project.name,status:"Offen" as TaskStatus,priority,due:formatDueDate(dueDate),assignee:"DL"};
    setTasks(t=>[createdTask,...t]);
    setProjectTasks(t=>[createdTask,...t]);
    setProjects(list=>list.map(item=>item.id===projectId?{...item,openTasks:item.openTasks+1}:item));
    setTaskModal(false);
    setTaskModalProjectId(null);
    if(!selectedProjectId)setActive("tasks");
  };
  const moveTask = (id: string, status: TaskStatus) => {
    setTasks(list=>list.map(task=>task.id===id?{...task,status}:task));
    setProjectTasks(list=>list.map(task=>task.id===id?{...task,status}:task));
    void fetch(`${API_URL}/tasks/${id}/status`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
  };
  const addProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data=new FormData(event.currentTarget), name=String(data.get("name")), description=String(data.get("description")||""), startDate=String(data.get("startDate")), endDate=String(data.get("endDate")||"")||null;
    const response=await fetch(`${API_URL}/projects`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,description,startDate,endDate})});
    const result=(await response.json()) as {id?:string;message?:string};
    if(!response.ok||!result.id){setLoginError(result.message??"Das Projekt konnte nicht gespeichert werden.");return;}
    const project:Project={id:result.id,name,description,status:"Aktiv",startDate,endDate,lead:"Dennis Lucking",members:1,openTasks:0};
    setProjects(list=>[project,...list]);
    setSelectedProjectId(project.id);
    setProjectModal(false);
  };
  const openTaskModal=(projectId?:string)=>{setTaskModalProjectId(projectId??null);setTaskModal(true);};
  if (!sessionChecked) return <main className={`login-page ${dark ? "dark" : ""}`} />;
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
        logout={() => { void fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }); setLoggedIn(false); setSessionChecked(true); }}
        projects={projects}
        openProject={(id)=>{setSelectedProjectId(id);nav("projects");}}
        newProject={()=>setProjectModal(true)}
      />
      {mobileOpen && (
        <button
          className="backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Menü schließen"
        />
      )}
      {loginError && <div className="app-message" role="alert"><span>{loginError}</span><button onClick={()=>setLoginError("")} aria-label="Hinweis schließen"><X/></button></div>}
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
          <Projects projects={projects} tasks={projectTasks} selectedProjectId={selectedProjectId} selectProject={setSelectedProjectId} newTask={openTaskModal} newProject={()=>setProjectModal(true)} moveTask={moveTask} />
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
        <TaskModal close={() => {setTaskModal(false);setTaskModalProjectId(null);}} submit={addTask} projects={projects} selectedProjectId={taskModalProjectId} />
      )}
      {projectModal && <ProjectModal close={()=>setProjectModal(false)} submit={addProject} />}
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
          Melde dich mit deinem Administratorkonto an.
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
  projects,
  openProject,
  newProject,
}: {
  active: View;
  nav: (v: View) => void;
  open: boolean;
  close: () => void;
  logout: () => void;
  projects: Project[];
  openProject: (id: string) => void;
  newProject: () => void;
}) {
  const items: Array<[View, string, typeof LayoutDashboard]> = [
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
        {projects.slice(0,5).map((p, index) => (
          <button
            className="project-link"
            onClick={() => openProject(p.id)}
            key={p.id}
          >
            <i style={{ background: projectColors[index % projectColors.length] }} />
            {p.name}
          </button>
        ))}
        <button className="add-project" onClick={newProject}>
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

function Projects({ projects, tasks, selectedProjectId, selectProject, newTask, newProject, moveTask }: {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string | null;
  selectProject: (id: string | null) => void;
  newTask: (projectId?: string) => void;
  newProject: () => void;
  moveTask: (id: string, status: TaskStatus) => void;
}) {
  const selected=projects.find(project=>project.id===selectedProjectId);
  const selectedTasks=selected ? tasks.filter(task=>task.projectId===selected.id) : [];
  const progress=(project:Project)=>{
    const projectTaskList=tasks.filter(task=>task.projectId===project.id);
    return projectTaskList.length ? Math.round(projectTaskList.filter(task=>task.status==="Erledigt").length/projectTaskList.length*100) : 0;
  };
  return (
    <div className="content">
      <PageHead
        eyebrow="PROJEKTE"
        title={selected ? selected.name : "Gemeinsam vorankommen."}
        sub={selected ? selected.description || "Projektaufgaben, Zuständigkeiten und Fortschritt." : "Alle aktiven Vorhaben, Zuständigkeiten und Fortschritte."}
        action={
          <button className="primary-button" onClick={selected ? ()=>newTask(selected.id) : newProject}>
            <Plus />
            {selected ? "Neue Aufgabe" : "Neues Projekt"}
          </button>
        }
      />
      {selected ? (
        <section className="project-detail">
          <button className="project-back" onClick={()=>selectProject(null)}>← Alle Projekte</button>
          <div className="project-detail-summary panel">
            <span><ListTodo/><b>{selectedTasks.filter(task=>task.status!=="Erledigt").length}</b><small>Offene Aufgaben</small></span>
            <span><CheckCircle2/><b>{progress(selected)}%</b><small>Fortschritt</small></span>
            <span><Users/><b>{selected.members}</b><small>Mitglieder</small></span>
            <span><UserCog/><b>{selected.lead}</b><small>Projektleitung</small></span>
          </div>
          <div className="project-task-panel panel">
            <header><div><h2>Aufgaben im Projekt</h2><p>Alle dem Projekt zugeordneten Aufgaben.</p></div><b>{selectedTasks.length}</b></header>
            {selectedTasks.length ? selectedTasks.map(task=>(
              <div className="project-task-row" key={task.id}>
                <button className="task-check" onClick={()=>moveTask(task.id,"Erledigt")} aria-label={`${task.title} erledigen`}>{task.status==="Erledigt"&&<Check/>}</button>
                <span><strong>{task.title}</strong><small>{task.due}</small></span>
                <span><i style={{background:statusColors[task.status]}}/>{task.status}</span>
                <span className={`priority p-${task.priority.toLowerCase()}`}>{task.priority}</span>
                <span className="avatar">{task.assignee}</span>
              </div>
            )):<div className="project-empty"><ListTodo/><h3>Noch keine Aufgaben</h3><p>Erstelle die erste Aufgabe für dieses Projekt.</p><button className="primary-button" onClick={()=>newTask(selected.id)}><Plus/>Aufgabe erstellen</button></div>}
          </div>
        </section>
      ) : (<>
      <div className="filterbar">
        <button className="filter-active">
          Aktiv <span>{projects.length}</span>
        </button>
        <button>Archiviert</button>
        <span />
        <button>
          <Grid3X3 />
          Kacheln
        </button>
      </div>
      <section className="project-grid-large">
        {projects.map((p, i) => {
          const value=progress(p), color=projectColors[i%projectColors.length];
          return (<article className="project-tile" key={p.id} onClick={()=>selectProject(p.id)}>
            <header>
              <span
                className="project-symbol big"
                style={{ background: color }}
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
                {tasks.filter(task=>task.projectId===p.id&&task.status!=="Erledigt").length} offene Aufgaben
              </span>
              <span>
                <Users />
                {p.members} Mitglieder
              </span>
            </div>
            <div className="progress-copy">
              <span>Projektfortschritt</span>
              <b>{value}%</b>
            </div>
            <div className="progress">
              <i style={{ width: `${value}%`, background: color }} />
            </div>
            <footer>
              <span className={`avatar avatar-${i}`}>
                {["LS", "MK", "DL"][i]}
              </span>
              <small>
                Leitung: <b>{p.lead}</b>
              </small>
              <button onClick={(event)=>{event.stopPropagation();newTask(p.id);}}>
                <Plus />
                Aufgabe
              </button>
            </footer>
          </article>);
        })}
      </section>
      </>)}
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
  moveTask: (id: string, s: TaskStatus) => void;
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
                moveTask(e.dataTransfer.getData("text"), col)
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
  projects,
  selectedProjectId,
}: {
  close: () => void;
  submit: (e: FormEvent<HTMLFormElement>) => void;
  projects: Project[];
  selectedProjectId: string | null;
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
            <select name="project" defaultValue={selectedProjectId??projects[0]?.id} required>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
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

function ProjectModal({close,submit}:{close:()=>void;submit:(event:FormEvent<HTMLFormElement>)=>void}) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <form className="form-modal" onSubmit={submit} onMouseDown={event=>event.stopPropagation()}>
        <header><div><h2>Neues Projekt</h2><p>Lege ein Projekt an und starte direkt mit den Aufgaben.</p></div><button type="button" onClick={close}><X/></button></header>
        <label>Projektname<input name="name" placeholder="Name des Projekts" autoFocus required minLength={2}/></label>
        <label>Beschreibung<textarea name="description" placeholder="Ziel und Kontext des Projekts …"/></label>
        <div className="form-two">
          <label>Startdatum<input name="startDate" type="date" defaultValue={new Date().toISOString().slice(0,10)} required/></label>
          <label>Enddatum<input name="endDate" type="date"/></label>
        </div>
        <footer><button type="button" onClick={close}>Abbrechen</button><button className="primary-button" type="submit">Projekt erstellen</button></footer>
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
