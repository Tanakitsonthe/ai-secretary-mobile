import { getTodayActivity, getAllAgents } from "@/lib/company";
import { todayBkkDate } from "@/lib/github";
import Link from "next/link";

export const revalidate = 30;

const EVENT_ICON: Record<string, string> = {
  task_start: "▶️",
  task_done: "✅",
  task_blocked: "🚧",
  task_cancelled: "✖",
  milestone: "🎯",
  report_refreshed: "🔄",
  refresh_skipped: "⏭️",
  weekly_proposed: "💡",
  workout_generated: "🏋️",
  push_sent: "🔔",
};

export default async function ActivityPage() {
  const today = todayBkkDate();
  const [events, agents] = await Promise.all([
    getTodayActivity(),
    getAllAgents(),
  ]);

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));
  const sorted = [...events].sort((a, b) => b.ts.localeCompare(a.ts));

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">⏱ Activity · {today}</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {events.length} เหตุการณ์วันนี้
        </p>
      </header>

      {sorted.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">💤</p>
          <p className="text-sm">ยังไม่มีกิจกรรม</p>
          <p className="text-[11px] mt-1">รอ routine ทำงานเช้านี้</p>
        </div>
      )}

      <div className="px-4 py-4">
        <ol className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-3">
          {sorted.map((e, i) => {
            const agent = agentBySlug.get(e.agent);
            const icon = EVENT_ICON[e.event] ?? "•";
            return (
              <li key={i} className="ml-4 relative">
                <span className="absolute -left-[1.5rem] top-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs">
                  {icon}
                </span>
                <div className="card p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    {agent ? (
                      <Link
                        href={`/agents/${agent.slug}`}
                        className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                      >
                        <span>{agent.emoji}</span>
                        <span>{agent.name}</span>
                      </Link>
                    ) : (
                      <span className="text-sm font-medium">{e.agent}</span>
                    )}
                    <span className="text-[10px] font-mono text-zinc-400 tabular shrink-0">
                      {e.ts.slice(11, 16)}
                    </span>
                  </div>
                  <p className="text-xs">
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {e.event}
                    </span>
                    {e.task_id && (
                      <span className="ml-2 text-[10px] font-mono text-zinc-500">
                        {e.task_id}
                      </span>
                    )}
                  </p>
                  {e.note && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {e.note}
                    </p>
                  )}
                  {(e.tokens_in || e.tokens_out) && (
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                      {e.tokens_in ?? 0} in · {e.tokens_out ?? 0} out
                    </p>
                  )}
                  {e.output && (
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono truncate">
                      → {e.output}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
