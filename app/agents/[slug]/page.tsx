import {
  getAgent,
  getAllAgents,
  getOKRs,
  getTodayTasks,
  getTodayActivity,
  getDepartments,
} from "@/lib/company";
import {
  AGENT_STATUS_TH,
  PRIORITY_TH,
  PRIORITY_DOT,
  TASK_STATUS_TH,
  EVENT_TH,
  SKILL_TH,
  formatTimeAgo,
} from "@/lib/labels";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

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

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-2">
        <Link href="/org" className="text-zinc-500 text-sm">
          ← กลับ
        </Link>
        <h1 className="ml-2 text-base font-semibold truncate">{agent.name}</h1>
      </header>

      {/* Profile card */}
      <section className="px-5 pt-5">
        <div className="card p-5 flex items-start gap-4">
          <Avatar emoji={agent.emoji} status={agent.status} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold leading-tight">{agent.name}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">
              {agent.role}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
              {dept && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">
                  {dept.emoji} {dept.name}
                </span>
              )}
              <span className="text-zinc-500">
                · {AGENT_STATUS_TH[agent.status]}
              </span>
              <span className="text-zinc-400">
                · ออนไลน์ {formatTimeAgo(agent.last_active)}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/chat?agent=${agent.slug}`}
          className="mt-3 block w-full text-center py-3 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          💬 คุยกับ {agent.name}
        </Link>
      </section>

      {/* Skills */}
      <section className="mx-5 mt-5">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2">
          ความสามารถ
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {agent.skills.map((s) => (
            <span
              key={s}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800"
            >
              {SKILL_TH[s] ?? s}
            </span>
          ))}
        </div>
      </section>

      {/* OKRs */}
      {myOKRs.length > 0 && (
        <section className="mx-5 mt-5">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2">
            🎯 รับผิดชอบเป้าหมาย
          </h3>
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {myOKRs.map((o) => (
              <li key={o.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <p className="text-sm font-medium leading-tight">{o.title}</p>
                  <span className="text-xs font-bold tabular shrink-0">
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

      {/* Tasks */}
      <section className="mx-5 mt-5">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2">
          📋 งานวันนี้ ({myTasks.length})
        </h3>
        {myTasks.length === 0 ? (
          <div className="card p-5 text-center text-xs text-zinc-500">
            ยังไม่มีงานวันนี้
          </div>
        ) : (
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {myTasks.map((t) => (
              <li key={t.id} className="px-4 py-3 flex items-start gap-2.5">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{t.title}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {PRIORITY_TH[t.priority]} · {TASK_STATUS_TH[t.status]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity */}
      <section className="mx-5 mt-5 mb-8">
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2">
          ⏱ กิจกรรมล่าสุด
        </h3>
        {myActivity.length === 0 ? (
          <div className="card p-5 text-center text-xs text-zinc-500">
            ยังไม่ได้ทำงานวันนี้
          </div>
        ) : (
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {myActivity.map((e, i) => {
              const ev = EVENT_TH[e.event] ?? { label: e.event, icon: "•" };
              return (
                <li key={i} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="text-base shrink-0">{ev.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ev.label}</p>
                    {e.note && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{e.note}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                    {e.ts.slice(11, 16)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
