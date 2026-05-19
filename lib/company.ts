import { listDir, readFile, todayBkkDate } from "@/lib/github";

export type AgentStatus = "idle" | "working" | "blocked" | "offline";

export type CompanyState = {
  schema_version: string;
  company_name: string;
  ceo: string;
  founded: string;
  last_updated: string;
  today: {
    date: string;
    weekday: string;
    priorities: string[];
    alerts: string[];
  };
  section_timestamps: Record<string, string>;
};

export type AgentProfile = {
  slug: string;
  name: string;
  emoji: string;
  department: string;
  role: string;
  hired: string;
  status: AgentStatus;
  last_active: string;
  current_task: string | null;
  skills: string[];
  owns_okrs: string[];
  content_path: string;
  kpi: string;
  prompt_file: string;
  scheduled_routines?: string[];
};

export type Department = {
  id: string;
  name: string;
  emoji: string;
  head: string;
  agents: string[];
};

export type DepartmentsFile = {
  departments: Department[];
};

export type OKRKeyResult = {
  id: string;
  metric: string;
  target: number;
  current: number;
};

export type Objective = {
  id: string;
  title: string;
  owner_agent?: string;
  owner_agents?: string[];
  department: string;
  target: string;
  current?: string;
  deadline?: string;
  progress_percent: number;
  key_results: OKRKeyResult[];
};

export type OKRsFile = {
  year: number;
  last_updated: string;
  objectives: Objective[];
};

export type TaskStatus = "todo" | "doing" | "done" | "blocked" | "cancelled";
export type Priority = "P0" | "P1" | "P2" | "P3";

export type Task = {
  id: string;
  title: string;
  assigned_to: string;
  proposed_by: string;
  okr_id: string | null;
  priority: Priority;
  status: TaskStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  deadline?: string;
  estimated_minutes?: number;
  output_path?: string;
  tokens_estimated?: number;
  dependencies: string[];
};

export type TasksFile = {
  date: string;
  tasks: Task[];
};

export type BudgetTotals = {
  date?: string;
  week_of?: string;
  month?: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
};

export type BudgetFile = {
  currency: string;
  rates_per_mtok: Record<string, { input: number; output: number }>;
  caps: { daily_usd: number; monthly_usd: number };
  totals: {
    today: BudgetTotals;
    this_week: BudgetTotals;
    this_month: BudgetTotals;
    lifetime: BudgetTotals;
  };
  per_agent_today: Record<string, BudgetTotals>;
  per_department_today: Record<string, BudgetTotals>;
};

export type CEOProfile = {
  name: string;
  nickname: string;
  email: string;
  preferred_language: string;
  timezone: string;
  year_of_birth: number;
  education: { program: string; year: string };
  platforms: string[];
  communication_style: {
    chat: string;
    docs: string;
    preference: string;
  };
  schedule: {
    wake: string;
    deep_work_hours: string[];
    sleep: string;
  };
  energy_pattern: string;
  current_focus_areas: string[];
  constraints: Record<string, string[]>;
  personal_projects: string[];
  values: string[];
};

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path);
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function getState(): Promise<CompanyState | null> {
  return readJson<CompanyState>("company/state.json");
}

export async function getCEOProfile(): Promise<CEOProfile | null> {
  return readJson<CEOProfile>("company/ceo_profile.json");
}

export async function getOKRs(): Promise<OKRsFile | null> {
  return readJson<OKRsFile>("company/okrs.json");
}

export async function getDepartments(): Promise<DepartmentsFile | null> {
  return readJson<DepartmentsFile>("company/departments.json");
}

export async function getBudget(): Promise<BudgetFile | null> {
  return readJson<BudgetFile>("company/budget.json");
}

export async function getAllAgents(): Promise<AgentProfile[]> {
  const files = await listDir("company/agents");
  const profiles = await Promise.all(
    files
      .filter((f) => f.type === "file" && f.name.endsWith(".json"))
      .map((f) => readJson<AgentProfile>(f.path))
  );
  return profiles.filter((p): p is AgentProfile => p !== null);
}

export async function getAgent(slug: string): Promise<AgentProfile | null> {
  return readJson<AgentProfile>(`company/agents/${slug}.json`);
}

export async function getTodayTasks(): Promise<TasksFile | null> {
  const today = todayBkkDate();
  return readJson<TasksFile>(`company/tasks/${today}.json`);
}

export async function getTasksForDate(date: string): Promise<TasksFile | null> {
  return readJson<TasksFile>(`company/tasks/${date}.json`);
}

export type ActivityEvent = {
  ts: string;
  agent: string;
  event: string;
  task_id?: string;
  note?: string;
  tokens_in?: number;
  tokens_out?: number;
  output?: string;
};

export async function getTodayActivity(): Promise<ActivityEvent[]> {
  const today = todayBkkDate();
  try {
    const raw = await readFile(`company/activity/${today}.jsonl`);
    return raw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as ActivityEvent);
  } catch {
    return [];
  }
}

export type CompanyStats = {
  agents_total: number;
  agents_by_status: Record<AgentStatus, number>;
  tasks_today: { todo: number; doing: number; done: number; total: number };
  cost_today_usd: number;
  okrs_avg_progress: number;
  active_alerts: number;
};

export async function getCompanyStats(): Promise<CompanyStats> {
  const [agents, tasks, budget, okrs, state] = await Promise.all([
    getAllAgents(),
    getTodayTasks(),
    getBudget(),
    getOKRs(),
    getState(),
  ]);

  const agents_by_status: Record<AgentStatus, number> = {
    idle: 0,
    working: 0,
    blocked: 0,
    offline: 0,
  };
  for (const a of agents) agents_by_status[a.status]++;

  const tasksArr = tasks?.tasks ?? [];
  const tasks_today = {
    todo: tasksArr.filter((t) => t.status === "todo").length,
    doing: tasksArr.filter((t) => t.status === "doing").length,
    done: tasksArr.filter((t) => t.status === "done").length,
    total: tasksArr.length,
  };

  const okrsArr = okrs?.objectives ?? [];
  const okrs_avg_progress =
    okrsArr.length === 0
      ? 0
      : Math.round(
          okrsArr.reduce((sum, o) => sum + (o.progress_percent ?? 0), 0) /
            okrsArr.length
        );

  return {
    agents_total: agents.length,
    agents_by_status,
    tasks_today,
    cost_today_usd: budget?.totals.today.cost_usd ?? 0,
    okrs_avg_progress,
    active_alerts: state?.today.alerts.length ?? 0,
  };
}
