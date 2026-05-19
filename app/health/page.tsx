import {
  getState,
  getCEOProfile,
  getOKRs,
  getDepartments,
  getBudget,
  getAllAgents,
  getTodayTasks,
  getTodayActivity,
  getAllMessages,
  getPendingProposals,
} from "@/lib/company";
import { todayBkkDate } from "@/lib/github";

export const revalidate = 30;

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

export default async function HealthPage() {
  const today = todayBkkDate();

  const [
    state,
    profile,
    okrs,
    departments,
    budget,
    agents,
    tasksFile,
    activity,
    messages,
    proposals,
  ] = await Promise.all([
    getState(),
    getCEOProfile(),
    getOKRs(),
    getDepartments(),
    getBudget(),
    getAllAgents(),
    getTodayTasks(),
    getTodayActivity(),
    getAllMessages(),
    getPendingProposals(),
  ]);

  const checks: Check[] = [
    {
      name: "company/state.json",
      ok: !!state,
      detail: state
        ? `v${state.schema_version} · updated ${state.last_updated.slice(0, 16)}`
        : "missing",
    },
    {
      name: "company/ceo_profile.json",
      ok: !!profile,
      detail: profile ? `${profile.name} (${profile.nickname})` : "missing",
    },
    {
      name: "company/okrs.json",
      ok: !!okrs && okrs.objectives.length > 0,
      detail: okrs ? `${okrs.objectives.length} objectives, year ${okrs.year}` : "missing",
    },
    {
      name: "company/departments.json",
      ok: !!departments && departments.departments.length > 0,
      detail: departments
        ? `${departments.departments.length} departments`
        : "missing",
    },
    {
      name: "company/budget.json",
      ok: !!budget,
      detail: budget
        ? `daily cap $${budget.caps.daily_usd} · ${Object.keys(budget.rates_per_mtok).length} models`
        : "missing",
    },
    {
      name: "company/agents/*.json",
      ok: agents.length >= 12,
      detail: `${agents.length} agent profiles loaded`,
    },
    {
      name: `company/tasks/${today}.json`,
      ok: !!tasksFile,
      detail: tasksFile
        ? `${tasksFile.tasks.length} tasks today`
        : "no tasks file for today (routine may not have run yet)",
    },
    {
      name: `company/activity/${today}.jsonl`,
      ok: activity.length > 0,
      detail:
        activity.length > 0
          ? `${activity.length} events today`
          : "no events yet today",
    },
    {
      name: "company/messages/",
      ok: true,
      detail: `${messages.length} messages total`,
    },
    {
      name: "company/proposals/",
      ok: true,
      detail: `${proposals.length} pending approval`,
    },
  ];

  const envChecks: Check[] = [
    {
      name: "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
      ok: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      detail: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ? `set (${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.slice(0, 12)}...)`
        : "MISSING — push subscribe will fail",
    },
    {
      name: "VAPID_PRIVATE_KEY",
      ok: !!process.env.VAPID_PRIVATE_KEY,
      detail: process.env.VAPID_PRIVATE_KEY
        ? "set (hidden)"
        : "MISSING — push send will fail",
    },
    {
      name: "VAPID_SUBJECT",
      ok: !!process.env.VAPID_SUBJECT,
      detail: process.env.VAPID_SUBJECT ?? "MISSING — push send will fail",
    },
    {
      name: "PUSH_INTERNAL_SECRET",
      ok: !!process.env.PUSH_INTERNAL_SECRET,
      detail: process.env.PUSH_INTERNAL_SECRET
        ? "set (hidden) — routines can auth"
        : "not set — push send is OPEN (any caller)",
    },
    {
      name: "GITHUB_TOKEN",
      ok: !!process.env.GITHUB_TOKEN,
      detail: process.env.GITHUB_TOKEN
        ? "set (this is what's reading company/)"
        : "MISSING — nothing works",
    },
  ];

  const dataPass = checks.filter((c) => c.ok).length;
  const envPass = envChecks.filter((c) => c.ok).length;
  const overall = dataPass + envPass;
  const total = checks.length + envChecks.length;
  const pct = Math.round((overall / total) * 100);

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">🩺 Health Check</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ตรวจระบบ {overall}/{total} ผ่าน
            </p>
          </div>
          <div
            className={`text-2xl font-bold tabular ${
              pct === 100
                ? "text-green-600"
                : pct >= 70
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {pct}%
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        <section>
          <h2 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
            📂 Data Files ({dataPass}/{checks.length})
          </h2>
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {checks.map((c) => (
              <CheckRow key={c.name} check={c} />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
            🔐 Env Vars ({envPass}/{envChecks.length})
          </h2>
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {envChecks.map((c) => (
              <CheckRow key={c.name} check={c} />
            ))}
          </ul>
        </section>

        {pct < 100 && (
          <div className="card p-3 border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200">
            ดู VERCEL_SETUP.md หรือบอก Claude เพื่อแก้ไขจุดที่ค้าง
          </div>
        )}
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: Check }) {
  return (
    <li className="px-4 py-2.5 flex items-center gap-3">
      <span className="text-lg shrink-0">{check.ok ? "✅" : "❌"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono">{check.name}</p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          {check.detail}
        </p>
      </div>
    </li>
  );
}
