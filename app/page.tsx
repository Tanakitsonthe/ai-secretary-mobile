import {
  getState,
  getCompanyStats,
  getTodayTasks,
  getOKRs,
  getAllAgents,
  getPendingProposals,
  getAllMessages,
} from "@/lib/company";
import { readFile, todayBkkDate } from "@/lib/github";
import { PRIORITY_TH, PRIORITY_DOT, TASK_STATUS_ICON, formatTimeAgo } from "@/lib/labels";
import Avatar from "@/components/Avatar";
import MarkdownView from "@/components/MarkdownView";
import SuggestNext from "@/components/SuggestNext";
import Link from "next/link";

export const revalidate = 300;

async function getTodayBrief() {
  const today = todayBkkDate();
  try {
    const content = await readFile(`stocks/daily-news/${today}.md`);
    return { content, date: today };
  } catch {
    try {
      const content = await readFile(`briefings/${today}_morning-prep.md`);
      return { content, date: today };
    } catch {
      return { content: null, date: today };
    }
  }
}

function thaiWeekday(d: string): string {
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  return days[new Date(d).getDay()] ?? "";
}

export default async function CEODashboard() {
  const today = todayBkkDate();

  const [state, stats, tasksFile, okrs, agents, brief, proposals, messages] =
    await Promise.all([
      getState(),
      getCompanyStats(),
      getTodayTasks(),
      getOKRs(),
      getAllAgents(),
      getTodayBrief(),
      getPendingProposals(),
      getAllMessages(),
    ]);

  const tasks = tasksFile?.tasks ?? [];
  const topTasks = tasks
    .filter((t) => t.status !== "done" && t.status !== "cancelled")
    .sort((a, b) => a.priority.localeCompare(b.priority))
    .slice(0, 5);

  const workingAgents = agents.filter((a) => a.status === "working");
  const onlineAgents = agents.filter((a) => a.status !== "offline").length;
  const unreadMessages = messages.filter((m) => !m.read && m.to === "ceo").length;

  const weekday = thaiWeekday(today);
  const dateText = new Date(today).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Hero */}
      <header className="px-5 pt-8 pb-5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">
            วัน{weekday} · {dateText}
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight">
            สวัสดี{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
              NUT
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            บริษัทของคุณกำลังทำงานอยู่
          </p>
        </div>
        <Link
          href="/search"
          aria-label="ค้นหา"
          className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg active:scale-95 transition-transform shrink-0 mt-1"
        >
          🔍
        </Link>
      </header>

      {/* Stats — bigger, more breathable */}
      <section className="mx-5 grid grid-cols-2 gap-3">
        <StatCard
          label="พนักงานออนไลน์"
          value={`${onlineAgents}/${agents.length}`}
          icon="👥"
          href="/org"
          color="from-blue-500/10 to-blue-600/5"
        />
        <StatCard
          label="งานวันนี้"
          value={`${stats.tasks_today.done}/${stats.tasks_today.total}`}
          sublabel={`${stats.tasks_today.todo} รอทำ`}
          icon="📋"
          href="/tasks"
          color="from-emerald-500/10 to-emerald-600/5"
        />
        <StatCard
          label="ค่าใช้จ่ายวันนี้"
          value={`฿${(stats.cost_today_usd * 35).toFixed(0)}`}
          sublabel={`$${stats.cost_today_usd.toFixed(2)}`}
          icon="💸"
          href="/budget"
          color="from-amber-500/10 to-amber-600/5"
        />
        <StatCard
          label="OKR เฉลี่ย"
          value={`${stats.okrs_avg_progress}%`}
          sublabel={`${okrs?.objectives.length ?? 0} เป้าหมาย`}
          icon="🎯"
          href="/okrs"
          color="from-violet-500/10 to-violet-600/5"
        />
      </section>

      {/* CEO Inbox */}
      {(proposals.length > 0 || unreadMessages > 0) && (
        <section className="mx-5 mt-5">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide mb-2 uppercase">
            กล่องของคุณ
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {proposals.length > 0 && (
              <Link
                href="/proposals"
                className="card p-3.5 border-amber-300/60 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 flex items-center gap-3 active:scale-[0.98]"
              >
                <span className="text-2xl">✋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                    รออนุมัติ
                  </p>
                  <p className="text-base font-bold">{proposals.length} ข้อ</p>
                </div>
              </Link>
            )}
            {unreadMessages > 0 && (
              <Link
                href="/messages"
                className="card p-3.5 border-blue-300/60 dark:border-blue-900/60 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 flex items-center gap-3 active:scale-[0.98]"
              >
                <span className="text-2xl">💌</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    ข้อความใหม่
                  </p>
                  <p className="text-base font-bold">{unreadMessages}</p>
                </div>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Alerts */}
      {state?.today.alerts && state.today.alerts.length > 0 && (
        <section className="mx-5 mt-5">
          <div className="card p-3.5 border-red-300/60 dark:border-red-900/60 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
            <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">
              ⚠ การแจ้งเตือน
            </p>
            {state.today.alerts.map((a, i) => (
              <p key={i} className="text-sm text-red-900 dark:text-red-100">
                {a}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* AI suggestion */}
      <section className="mt-6 mx-5">
        <SuggestNext />
      </section>

      {/* Today's tasks */}
      <Section title="ภารกิจวันนี้" href="/tasks" hrefLabel={`ดูทั้งหมด (${stats.tasks_today.total})`}>
        {topTasks.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-3xl mb-1">🎉</p>
            <p className="text-sm font-medium">ไม่มีงานค้าง</p>
            <p className="text-xs text-zinc-500 mt-1">พักได้สบายๆ</p>
          </div>
        ) : (
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {topTasks.map((t) => {
              const agent = agents.find((a) => a.slug === t.assigned_to);
              return (
                <li key={t.id}>
                  <Link
                    href="/tasks"
                    className="flex items-start gap-3 px-4 py-3 active:bg-zinc-50 dark:active:bg-zinc-800/50"
                  >
                    <span
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`}
                      title={PRIORITY_TH[t.priority]}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          t.status === "done"
                            ? "line-through text-zinc-500"
                            : "font-medium"
                        }`}
                      >
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                        <span>{TASK_STATUS_ICON[t.status]}</span>
                        {agent && (
                          <span className="flex items-center gap-1">
                            <span>{agent.emoji}</span>
                            <span>{agent.name}</span>
                          </span>
                        )}
                        <span className="ml-auto">{PRIORITY_TH[t.priority]}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Working now */}
      {workingAgents.length > 0 && (
        <Section title="กำลังทำงานอยู่" href="/org" hrefLabel="ดูทีม">
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {workingAgents.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/agents/${a.slug}`}
                  className="flex items-center gap-3 px-4 py-3 active:bg-zinc-50 dark:active:bg-zinc-800/50"
                >
                  <Avatar emoji={a.emoji} status={a.status} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{a.role}</p>
                  </div>
                  <span className="text-[10px] font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    ทำงาน
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* OKR progress */}
      {okrs && okrs.objectives.length > 0 && (
        <Section title={`เป้าหมายปี ${okrs.year}`} href="/okrs" hrefLabel="ดูเต็ม">
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {okrs.objectives.slice(0, 3).map((o) => (
              <li key={o.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <p className="text-sm font-medium leading-tight">{o.title}</p>
                  <span className="text-sm font-bold tabular shrink-0">
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
        </Section>
      )}

      {/* Today's brief preview */}
      <Section title="สรุปข่าวเช้านี้" href="/briefs" hrefLabel="ดูทั้งหมด">
        {brief.content ? (
          <div className="card overflow-hidden max-h-[420px] overflow-y-auto">
            <MarkdownView content={brief.content} />
          </div>
        ) : (
          <div className="card p-6 text-center">
            <div className="text-3xl mb-1">🌙</div>
            <p className="text-sm font-medium">ยังไม่มี brief วันนี้</p>
            <p className="text-xs text-zinc-500 mt-1">รอเช้าพรุ่งนี้ 07:20</p>
          </div>
        )}
      </Section>

      {/* Quick links — like Teams chat tiles */}
      <Section title="ทางลัด">
        <div className="grid grid-cols-3 gap-2.5">
          <QuickTile href="/quick" icon="⚡" label="เพิ่มงานเร็ว" />
          <QuickTile href="/reflect" icon="📝" label="ทบทวนวัน" />
          <QuickTile href="/activity" icon="⏱" label="ดูกิจกรรม" />
        </div>
      </Section>

      <p className="mt-8 px-5 pb-4 text-center text-[10px] text-zinc-400 dark:text-zinc-600">
        NUT Inc. · ระบบ AI ส่วนตัว · อัพเดท {state ? formatTimeAgo(state.last_updated) : "—"}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  icon,
  href,
  color,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`card p-3.5 bg-gradient-to-br ${color} active:scale-[0.98] transition-transform`}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold tabular mt-1.5">{value}</p>
      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{label}</p>
      {sublabel && (
        <p className="text-[10px] text-zinc-500 mt-0.5">{sublabel}</p>
      )}
    </Link>
  );
}

function Section({
  title,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 mx-5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        {href && hrefLabel && (
          <Link
            href={href}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 active:underline"
          >
            {hrefLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function QuickTile({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="card p-3 flex flex-col items-center text-center active:scale-95 transition-transform"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[11px] font-medium mt-1.5 leading-tight">{label}</span>
    </Link>
  );
}
