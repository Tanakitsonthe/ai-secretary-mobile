import {
  getAgent,
  getAllAgents,
  getOKRs,
  getTodayTasks,
  getTodayActivity,
  getDepartments,
} from "@/lib/company";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

const STATUS_COLOR: Record<string, string> = {
  idle: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  working: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  blocked: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  offline: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500",
};

const STATUS_LABEL: Record<string, string> = {
  idle: "ว่าง",
  working: "ทำงานอยู่",
  blocked: "ติด",
  offline: "ออฟไลน์",
};

export async function generateStaticParams() {
  const agents = await getAllAgents();
  return agents.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
  const [agent, okrs, tasksFile, activity, departments] = await Promise.all([
    getAgent(slug),
    getOKRs(),
    getTodayTasks(),
    getTodayActivity(),
    getDepartments(),
  ]);

  if (!agent) notFound();

  const myTasks = (tasksFile?.tasks ?? []).filter(
    (t) => t.assigned_to === agent.slug
  );
  const myActivity = activity.filter((e) => e.agent === agent.slug).slice(-10).reverse();
  const myOKRs = (okrs?.objectives ?? []).filter(
    (o) =>
      o.owner_agent === agent.slug ||
      (o.owner_agents ?? []).includes(agent.slug)
  );
  const dept = departments?.departments.find((d) => d.id === agent.department);

  const chatUrl = `/chat?agent=${agent.slug}`;

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-2">
        <Link
          href="/org"
          className="text-zinc-500 dark:text-zinc-400 text-sm"
        >
          ← Org
        </Link>
        <div className="flex-1" />
      </header>

      {/* Profile */}
      <section className="px-5 pt-5">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{agent.emoji}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-tight">{agent.name}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {agent.role}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  STATUS_COLOR[agent.status]
                }`}
              >
                {STATUS_LABEL[agent.status]}
              </span>
              {dept && (
                <span className="text-[11px] text-zinc-500">
                  {dept.emoji} {dept.name}
                </span>
              )}
              {dept?.head === agent.slug && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  HEAD
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          href={chatUrl}
          className="mt-4 block w-full text-center py-3 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          💬 คุยกับ {agent.name}
        </Link>
      </section>

      {/* KPI */}
      <section className="mx-5 mt-5 card p-3">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-1">
          KPI
        </p>
        <p className="text-sm">{agent.kpi}</p>
      </section>

      {/* Skills */}
      <section className="mx-5 mt-3">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2 px-1">
          Skills
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {agent.skills.map((s) => (
            <span
              key={s}
              className="text-[11px] px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* OKRs owned */}
      {myOKRs.length > 0 && (
        <section className="mx-5 mt-5">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2 px-1">
            🎯 รับผิดชอบ OKR
          </p>
          <ul className="space-y-2">
            {myOKRs.map((o) => (
              <li key={o.id} className="card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">
                    <span className="font-mono text-violet-600 dark:text-violet-400 mr-1.5">
                      {o.id}
                    </span>
                    {o.title}
                  </span>
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

      {/* Tasks today */}
      <section className="mx-5 mt-5">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2 px-1">
          📋 งานวันนี้ ({myTasks.length})
        </p>
        {myTasks.length === 0 ? (
          <div className="card p-4 text-center text-xs text-zinc-500">
            ไม่มีงานที่มอบหมาย
          </div>
        ) : (
          <ul className="space-y-2">
            {myTasks.map((t) => (
              <li key={t.id} className="card p-2.5">
                <p className="text-sm">
                  <span className="text-[10px] font-mono text-zinc-400 mr-1.5">
                    {t.id}
                  </span>
                  {t.title}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {t.priority} · {t.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity */}
      <section className="mx-5 mt-5 mb-8">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-semibold mb-2 px-1">
          ⏱ กิจกรรมล่าสุด
        </p>
        {myActivity.length === 0 ? (
          <div className="card p-4 text-center text-xs text-zinc-500">
            ไม่มีกิจกรรมวันนี้
          </div>
        ) : (
          <ul className="space-y-1.5">
            {myActivity.map((e, i) => (
              <li key={i} className="card p-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-[10px] text-zinc-500">
                    {e.ts.slice(11, 16)}
                  </span>
                  <span className="font-medium">{e.event}</span>
                  {e.task_id && (
                    <span className="text-[10px] font-mono text-zinc-400">
                      {e.task_id}
                    </span>
                  )}
                </div>
                {e.note && (
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                    {e.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="px-5 pb-4 text-[10px] text-zinc-400 text-center">
        จ้างเมื่อ {agent.hired} · last active {agent.last_active.slice(0, 16)}
      </p>
    </div>
  );
}
