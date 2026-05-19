import { getTodayTasks, getAllAgents, type Task } from "@/lib/company";
import { todayBkkDate } from "@/lib/github";
import {
  TASK_STATUS_TH,
  TASK_STATUS_ICON,
  TASK_STATUS_ORDER,
} from "@/lib/labels";
import TaskRow from "./TaskRow";
import Link from "next/link";

export const revalidate = 60;

function thaiDate(d: string): string {
  return new Date(d).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

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
    (a, b) =>
      (TASK_STATUS_ORDER[a as keyof typeof TASK_STATUS_ORDER] ?? 99) -
      (TASK_STATUS_ORDER[b as keyof typeof TASK_STATUS_ORDER] ?? 99)
  );

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">งานวันนี้</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {thaiDate(today)} · {tasks.length} งาน
        </p>
      </header>

      {tasks.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">ยังไม่มีงานวันนี้</p>
          <Link
            href="/quick"
            className="inline-block mt-3 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold"
          >
            + เพิ่มงาน
          </Link>
        </div>
      )}

      <div className="px-4 py-4 space-y-5">
        {sortedStatuses.map((status) => {
          const items = grouped[status];
          const tStatus = status as keyof typeof TASK_STATUS_TH;
          return (
            <section key={status}>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <span>{TASK_STATUS_ICON[tStatus]}</span>
                  <span>{TASK_STATUS_TH[tStatus]}</span>
                </h2>
                <span className="text-[11px] text-zinc-500">{items.length} งาน</span>
              </div>
              <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
                {items.map((t) => {
                  const agent = agentBySlug.get(t.assigned_to);
                  return (
                    <TaskRow
                      key={t.id}
                      task={t}
                      date={today}
                      agentEmoji={agent?.emoji}
                      agentName={agent?.name}
                      agentSlug={agent?.slug}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {tasks.length > 0 && (
        <div className="px-4 pb-8 text-center">
          <Link
            href="/quick"
            className="inline-block px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            + เพิ่มงานใหม่
          </Link>
        </div>
      )}
    </div>
  );
}
