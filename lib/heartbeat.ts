import { readFile, writeFile } from "@/lib/github";
import type {
  AgentProfile,
  AgentStatus,
  TasksFile,
  Task,
  Priority,
  TaskStatus,
  CompanyState,
  BudgetFile,
} from "@/lib/company";

export function nowBkkIso(): string {
  const now = new Date();
  const offset = 7 * 60;
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 19) + "+07:00";
}

export function todayBkk(): string {
  return nowBkkIso().slice(0, 10);
}

export function bkkWeekday(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const offset = 7 * 60;
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return days[local.getDay()];
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path)) as T;
  } catch {
    return null;
  }
}

async function writeJson(path: string, data: unknown, message: string): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", message);
}

export async function setAgentStatus(
  slug: string,
  status: AgentStatus,
  currentTask: string | null = null
): Promise<void> {
  const path = `company/agents/${slug}.json`;
  const agent = await readJson<AgentProfile>(path);
  if (!agent) return;
  agent.status = status;
  agent.last_active = nowBkkIso();
  agent.current_task = currentTask;
  if (status === "idle") {
    agent.total_tasks_completed = (agent.total_tasks_completed ?? 0) + 1;
  }
  await writeJson(path, agent, `[${slug}] status=${status}`);
}

export async function appendActivity(
  agent: string,
  event: string,
  extra: {
    task_id?: string;
    note?: string;
    tokens_in?: number;
    tokens_out?: number;
    output?: string;
  } = {}
): Promise<void> {
  const date = todayBkk();
  const path = `company/activity/${date}.jsonl`;
  let existing = "";
  try {
    existing = await readFile(path);
  } catch {}
  const line = JSON.stringify({
    ts: nowBkkIso(),
    agent,
    event,
    ...extra,
  });
  const next = (existing ? existing + (existing.endsWith("\n") ? "" : "\n") : "") + line + "\n";
  await writeFile(path, next, `[${agent}] ${event}`);
}

export async function upsertTask(
  task: Partial<Task> & Pick<Task, "id" | "title" | "assigned_to">
): Promise<void> {
  const date = todayBkk();
  const path = `company/tasks/${date}.json`;
  let file = await readJson<TasksFile>(path);
  if (!file) file = { date, tasks: [] };

  const idx = file.tasks.findIndex((t) => t.id === task.id);
  const merged: Task = {
    id: task.id,
    title: task.title,
    assigned_to: task.assigned_to,
    proposed_by: task.proposed_by ?? "system",
    okr_id: task.okr_id ?? null,
    priority: (task.priority ?? "P2") as Priority,
    status: (task.status ?? "todo") as TaskStatus,
    created_at: task.created_at ?? nowBkkIso(),
    started_at: task.started_at,
    completed_at: task.completed_at,
    output_path: task.output_path,
    tokens_estimated: task.tokens_estimated,
    deadline: task.deadline,
    estimated_minutes: task.estimated_minutes,
    dependencies: task.dependencies ?? [],
  };

  if (idx >= 0) file.tasks[idx] = { ...file.tasks[idx], ...merged };
  else file.tasks.push(merged);

  await writeJson(path, file, `[${task.assigned_to}] task ${task.id}`);
}

export async function touchState(): Promise<void> {
  const path = "company/state.json";
  const state = await readJson<CompanyState>(path);
  if (!state) return;
  const now = nowBkkIso();
  state.last_updated = now;
  state.today.date = todayBkk();
  state.today.weekday = bkkWeekday();
  state.section_timestamps = {
    ...state.section_timestamps,
    agents: now,
    tasks: now,
  };
  await writeJson(path, state, "[state] heartbeat");
}

export async function addTokenUsage(
  agentSlug: string,
  department: string,
  model: string,
  tokensIn: number,
  tokensOut: number
): Promise<void> {
  const path = "company/budget.json";
  const budget = await readJson<BudgetFile>(path);
  if (!budget) return;
  const rates = budget.rates_per_mtok[model] ?? { input: 1, output: 5 };
  const cost = (tokensIn / 1_000_000) * rates.input + (tokensOut / 1_000_000) * rates.output;

  const today = todayBkk();
  const month = today.slice(0, 7);

  // Reset today if date changed
  if (budget.totals.today.date !== today) {
    budget.totals.today = {
      date: today,
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: 0,
    };
    budget.per_agent_today = {};
    budget.per_department_today = {};
  }
  if (budget.totals.this_month.month !== month) {
    budget.totals.this_month = {
      month,
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: 0,
    };
  }

  budget.totals.today.input_tokens += tokensIn;
  budget.totals.today.output_tokens += tokensOut;
  budget.totals.today.cost_usd += cost;

  budget.totals.this_month.input_tokens += tokensIn;
  budget.totals.this_month.output_tokens += tokensOut;
  budget.totals.this_month.cost_usd += cost;

  budget.totals.lifetime.input_tokens += tokensIn;
  budget.totals.lifetime.output_tokens += tokensOut;
  budget.totals.lifetime.cost_usd += cost;

  if (!budget.per_agent_today[agentSlug])
    budget.per_agent_today[agentSlug] = {
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: 0,
    };
  budget.per_agent_today[agentSlug].input_tokens += tokensIn;
  budget.per_agent_today[agentSlug].output_tokens += tokensOut;
  budget.per_agent_today[agentSlug].cost_usd += cost;

  if (!budget.per_department_today[department])
    budget.per_department_today[department] = {
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: 0,
    };
  budget.per_department_today[department].input_tokens += tokensIn;
  budget.per_department_today[department].output_tokens += tokensOut;
  budget.per_department_today[department].cost_usd += cost;

  await writeJson(path, budget, `[budget] +$${cost.toFixed(4)} ${agentSlug}`);
}

export async function sendPushIfSubscribed(
  baseUrl: string,
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<void> {
  const secret = process.env.PUSH_INTERNAL_SECRET;
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers.Authorization = `Bearer ${secret}`;
    await fetch(`${baseUrl}/api/push/send`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    // ignore push failures — non-critical
  }
}

export function getBaseUrl(): string {
  // Vercel provides VERCEL_URL automatically
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;
  return process.env.PWA_BASE_URL ?? "http://localhost:3000";
}

export function isAuthorizedCron(req: Request): boolean {
  // Vercel adds Authorization: Bearer {CRON_SECRET} automatically
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev / no secret set
  return auth === `Bearer ${secret}`;
}
