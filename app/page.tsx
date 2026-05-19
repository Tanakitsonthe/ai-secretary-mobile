import {
  getState,
  getCompanyStats,
  getTodayTasks,
  getOKRs,
  getAllAgents,
} from "@/lib/company";
import { readFile, todayBkkDate } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";

export const revalidate = 300;

async function getTodayBrief() {
  const today = todayBkkDate();
  try {
    const content = await readFile(`stocks/daily-news/${today}.md`);
    return { content, date: today, found: true, isFallback: false };
  } catch {
    try {
      const content = await readFile(`briefings/${today}_morning-prep.md`);
      return { content, date: today, found: true, isFallback: false };
    } catch {
      return { content: null, date: today, found: false, isFallback: false };
    }
  }
}

const PRIORITY_COLOR: Record<string, string> = {
  P0: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  P1: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  P2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  P3: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
};

const STATUS_EMOJI: Record<string, string> = {
  todo: "⏳",
  doing: "▶️",
  done: "✅",
  blocked: "🚧",
  cancelled: "✖",
};

export default async function CEODashboard() {
  const today = todayBkkDate();

  const [state, stats, tasksFile, okrs, agents, brief] = await Promise.all([
    getState(),
    getCompanyStats(),
    getTodayTasks(),
    getOKRs(),
    getAllAgents(),
    getTodayBrief(),
  ]);

  const tasks = tasksFile?.tasks ?? [];
  const topTasks = tasks
    .filter((t) => t.status !== "done" && t.status !== "cancelled")
    .sort((a, b) => a.priority.localeCompare(b.priority))
    .slice(0, 5);

  const workingAgents = agents.filter((a) => a.status === "working");
  const totalAgents = agents.length;
  const onlineAgents = totalAgents - (stats.agents_by_status.offline ?? 0);

  return (
    <div>
      {/* Hero — CEO greeting */}
      <header className="px-5 pt-8 pb-4">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular tracking-wide uppercase">
          {today} · {state?.today.weekday ?? ""}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          สวัสดี{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
            CEO
          </span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {state?.company_name ?? "NUT Inc."} · บริษัท AI ของคุณ
        </p>
      </header>

      {/* Stats strip */}
      <section className="mx-5 grid grid-cols-4 gap-2">
        <StatPill
          label="พนักงาน"
          value={`${onlineAgents}/${totalAgents}`}
          icon="👥"
          href="/org"
        />
        <StatPill
          label="งานวันนี้"
          value={`${stats.tasks_today.done}/${stats.tasks_today.total}`}
          icon="📋"
          href="/tasks"
        />
        <StatPill
          label="ค่าใช้จ่าย"
          value={`$${stats.cost_today_usd.toFixed(2)}`}
          icon="💸"
          href="/budget"
        />
        <StatPill
          label="OKR avg"
          value={`${stats.okrs_avg_progress}%`}
          icon="🎯"
          href="/okrs"
        />
      </section>

      {/* Alerts (if any) */}
      {state?.today.alerts && state.today.alerts.length > 0 && (
        <section className="mx-5 mt-4">
          <div className="card p-3 border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
              ⚠ Alerts
            </p>
            {state.today.alerts.map((a, i) => (
              <p key={i} className="text-sm text-amber-900 dark:text-amber-100">
                · {a}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Top priorities */}
      <section className="mx-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            🔥 วันนี้ต้องทำ
          </h2>
          <Link
            href="/tasks"
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            ดูทั้งหมด ({stats.tasks_today.total}) →
          </Link>
        </div>

        {topTasks.length === 0 ? (
          <div className="card p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-medium">ไม่มีงานค้าง</p>
            <p className="text-xs text-zinc-500 mt-1">CEO สามารถพักได้</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {topTasks.map((t) => {
              const agent = agents.find((a) => a.slug === t.assigned_to);
              return (
                <li
                  key={t.id}
                  className="card p-3 flex items-start gap-3"
                >
                  <span className="text-lg leading-none mt-0.5">
                    {STATUS_EMOJI[t.status]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          PRIORITY_COLOR[t.priority]
                        }`}
                      >
                        {t.priority}
                      </span>
                      {agent && (
                        <Link
                          href={`/agents/${agent.slug}`}
                          className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:underline"
                        >
                          {agent.emoji} {agent.name}
                        </Link>
                      )}
                      {t.okr_id && (
                        <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400">
                          {t.okr_id}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Working now */}
      {workingAgents.length > 0 && (
        <section className="mx-5 mt-6">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2">
            ⚙️ กำลังทำงาน
          </h2>
          <div className="flex gap-2 flex-wrap">
            {workingAgents.map((a) => (
              <Link
                key={a.slug}
                href={`/agents/${a.slug}`}
                className="card px-3 py-1.5 flex items-center gap-1.5 text-xs"
              >
                <span>{a.emoji}</span>
                <span className="font-medium">{a.name}</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* OKR progress */}
      {okrs && okrs.objectives.length > 0 && (
        <section className="mx-5 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
              🎯 OKR {okrs.year}
            </h2>
            <Link
              href="/okrs"
              className="text-xs font-medium text-blue-600 dark:text-blue-400"
            >
              ดูเต็ม →
            </Link>
          </div>
          <ul className="space-y-2">
            {okrs.objectives.slice(0, 3).map((o) => (
              <li key={o.id} className="card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium">
                    <span className="font-mono text-violet-600 dark:text-violet-400 mr-1.5">
                      {o.id}
                    </span>
                    {o.title}
                  </p>
                  <span className="text-xs font-bold tabular">
                    {o.progress_percent}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                    style={{ width: `${o.progress_percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Today's brief preview */}
      <section className="mt-6 mx-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            🌅 Today&apos;s Brief
          </h2>
          <Link
            href="/briefs"
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        {brief.content ? (
          <div className="card overflow-hidden max-h-[400px] overflow-y-auto">
            <MarkdownView content={brief.content} />
          </div>
        ) : (
          <div className="card p-6 text-center">
            <div className="text-2xl mb-1">🌙</div>
            <p className="text-sm font-medium">ยังไม่มี brief วันนี้</p>
            <p className="text-xs text-zinc-500 mt-1">
              Routine ทำงาน 07:20 BKK ทุกเช้า
            </p>
          </div>
        )}
      </section>

      <p className="mt-8 px-5 text-center text-[10px] text-zinc-400 dark:text-zinc-600">
        {state?.company_name ?? "NUT Inc."} v{state?.schema_version ?? "2.0.0"} ·
        powered by Claude
      </p>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card p-2 flex flex-col items-center text-center active:scale-95 transition-transform"
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-sm font-bold mt-1 tabular">{value}</span>
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
        {label}
      </span>
    </Link>
  );
}
