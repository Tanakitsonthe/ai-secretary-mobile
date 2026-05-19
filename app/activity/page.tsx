import { getTodayActivity, getAllAgents } from "@/lib/company";
import { todayBkkDate } from "@/lib/github";
import { EVENT_TH } from "@/lib/labels";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export const revalidate = 30;

function thaiDate(d: string): string {
  return new Date(d).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

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
        <h1 className="text-lg font-bold">กิจกรรมของทีม</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {thaiDate(today)} · {events.length} เหตุการณ์
        </p>
      </header>

      {sorted.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">💤</p>
          <p className="text-sm">ยังไม่มีกิจกรรม</p>
          <p className="text-[11px] mt-1">รอ routine ทำงานเช้านี้</p>
        </div>
      )}

      <ul className="px-4 py-4 space-y-2">
        {sorted.map((e, i) => {
          const agent = agentBySlug.get(e.agent);
          const ev = EVENT_TH[e.event] ?? { label: e.event, icon: "•" };
          return (
            <li key={i} className="card p-3 flex items-start gap-3">
              {agent ? (
                <Avatar emoji={agent.emoji} size="md" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg">
                  {ev.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {agent ? (
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {agent.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold">{e.agent}</span>
                  )}
                  <span className="text-[11px] text-zinc-500">
                    · {ev.icon} {ev.label}
                  </span>
                  <span className="ml-auto text-[10px] text-zinc-400 tabular">
                    {e.ts.slice(11, 16)}
                  </span>
                </div>
                {e.note && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {e.note}
                  </p>
                )}
                {(e.tokens_in || e.tokens_out) && (
                  <p className="text-[10px] text-zinc-400 mt-1">
                    ใช้ token {(e.tokens_in ?? 0) + (e.tokens_out ?? 0)} ตัว
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
