import { getTodayTasks, getAllAgents, type Task } from "@/lib/company";
import { todayBkkDate } from "@/lib/github";
import Link from "next/link";

export const revalidate = 300;

const PRIORITY_COLOR: Record<string, string> = {
  P0: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  P1: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  P2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  P3: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
};

const STATUS_ORDER: Record<string, number> = {
  doing: 0,
  todo: 1,
  blocked: 2,
  done: 3,
  cancelled: 4,
};

const STATUS_GROUP: Record<string, { label: string; icon: string }> = {
  doing: { label: "กำลังทำ", icon: "▶️" },
  todo: { label: "รอทำ", icon: "⏳" },
  blocked: { label: "ติด", icon: "🚧" },
  done: { label: "เสร็จแล้ว", icon: "✅" },
  cancelled: { label: "ยกเลิก", icon: "✖" },
};

export default async function TasksPage() {
  const today = todayBkkDate();
  const [tasksFile, agents] = await Promise.all([
    getTodayTasks(),
    getAllAgents(),
  ]);

  const tasks = tasksFile?.tasks ?? [];
  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));

  const grouped: Record<string, Task[]> = {};
  for (const t of tasks) {
    grouped[t.status] = grouped[t.status] || [];
    grouped[t.status].push(t);
  }
  for (const k of Object.keys(grouped)) {
    grouped[k].sort((a, b) => a.priority.localeCompare(b.priority));
  }

  const sortedStatuses = Object.keys(grouped).sort(
    (a, b) => (STATUS_ORDER[a] ?? 99) - (STATUS_ORDER[b] ?? 99)
  );

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">📋 Tasks · {today}</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {tasks.length} งานทั้งหมดวันนี้
        </p>
      </header>

      {tasks.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">ยังไม่มีงานวันนี้</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-5">
        {sortedStatuses.map((status) => {
          const group = STATUS_GROUP[status] ?? { label: status, icon: "•" };
          const items = grouped[status];
          return (
            <section key={status}>
              <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
                {group.icon} {group.label} ({items.length})
              </h2>
              <ul className="space-y-2">
                {items.map((t) => {
                  const agent = agentBySlug.get(t.assigned_to);
                  return (
                    <li key={t.id} className="card p-3">
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                            PRIORITY_COLOR[t.priority]
                          }`}
                        >
                          {t.priority}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium leading-snug ${
                              t.status === "done"
                                ? "line-through text-zinc-500"
                                : ""
                            }`}
                          >
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-zinc-500 dark:text-zinc-400">
                            {agent && (
                              <Link
                                href={`/agents/${agent.slug}`}
                                className="hover:underline"
                              >
                                {agent.emoji} {agent.name}
                              </Link>
                            )}
                            {t.okr_id && (
                              <span className="font-mono text-violet-600 dark:text-violet-400">
                                {t.okr_id}
                              </span>
                            )}
                            {t.estimated_minutes && (
                              <span>⏱ {t.estimated_minutes}m</span>
                            )}
                            {t.deadline && (
                              <span>📅 {t.deadline.slice(11, 16)}</span>
                            )}
                          </div>
                          {t.output_path && (
                            <p className="text-[10px] text-zinc-400 mt-1 font-mono truncate">
                              → {t.output_path}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
