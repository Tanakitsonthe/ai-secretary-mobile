import { listDir, todayBkkDate } from "@/lib/github";
import { getTasksForDate, type TasksFile } from "@/lib/company";
import { TASK_STATUS_ICON, PRIORITY_DOT } from "@/lib/labels";
import Link from "next/link";

export const revalidate = 300;

function bkkToday(): Date {
  const now = new Date();
  const offset = 7 * 60;
  return new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
}

function shiftDate(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function weekdayTh(d: Date): string {
  const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  return days[d.getDay()];
}

export default async function CalendarPage() {
  const today = bkkToday();
  const today_key = todayBkkDate();

  // Get all task files
  const files = await listDir("company/tasks").catch(() => []);
  const taskDates = new Set(
    files
      .filter((f) => f.type === "file" && f.name.endsWith(".json"))
      .map((f) => f.name.replace(".json", ""))
  );

  // Show 7 days centered: 3 past + today + 3 future
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(today, i - 3));

  // Fetch tasks for each day that exists
  const tasksByDay = new Map<string, TasksFile | null>();
  await Promise.all(
    days.map(async (d) => {
      const key = dateKey(d);
      if (taskDates.has(key)) {
        tasksByDay.set(key, await getTasksForDate(key));
      } else {
        tasksByDay.set(key, null);
      }
    })
  );

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">ปฏิทินงาน</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          7 วันรอบวันนี้
        </p>
      </header>

      {/* Day strip */}
      <div className="px-3 py-3 overflow-x-auto">
        <div className="flex gap-2">
          {days.map((d) => {
            const key = dateKey(d);
            const isToday = key === today_key;
            const tasks = tasksByDay.get(key)?.tasks ?? [];
            const open = tasks.filter(
              (t) => t.status !== "done" && t.status !== "cancelled"
            ).length;
            return (
              <a
                key={key}
                href={`#day-${key}`}
                className={`shrink-0 w-14 py-2 rounded-2xl text-center ${
                  isToday
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <p className="text-[10px] font-medium uppercase tracking-wide">
                  {weekdayTh(d)}
                </p>
                <p className="text-lg font-bold tabular leading-tight">
                  {d.getDate()}
                </p>
                {open > 0 && (
                  <p className={`text-[10px] ${isToday ? "text-blue-100" : "text-blue-600 dark:text-blue-400"} font-medium`}>
                    {open} งาน
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Day-by-day list */}
      <div className="px-4 pb-8 space-y-5">
        {days.map((d) => {
          const key = dateKey(d);
          const isToday = key === today_key;
          const tasks = tasksByDay.get(key)?.tasks ?? [];
          const label = d.toLocaleDateString("th-TH", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });

          return (
            <section key={key} id={`day-${key}`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-sm font-bold">
                  {label}
                  {isToday && (
                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      วันนี้
                    </span>
                  )}
                </h2>
                <span className="text-[11px] text-zinc-500">
                  {tasks.length} งาน
                </span>
              </div>
              {tasks.length === 0 ? (
                <div className="card p-4 text-center text-xs text-zinc-500">
                  ไม่มีงาน
                </div>
              ) : (
                <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className="px-4 py-2.5 flex items-start gap-3"
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            t.status === "done"
                              ? "line-through text-zinc-500"
                              : ""
                          }`}
                        >
                          {t.title}
                        </p>
                      </div>
                      <span className="text-xs shrink-0">
                        {TASK_STATUS_ICON[t.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {isToday && (
                <Link
                  href="/tasks"
                  className="block mt-2 text-center text-xs text-blue-600 dark:text-blue-400 font-medium"
                >
                  จัดการงานวันนี้ →
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
