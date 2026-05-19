import { getOKRs, getAllAgents } from "@/lib/company";
import Link from "next/link";

export const revalidate = 300;

export default async function OKRsPage() {
  const [okrs, agents] = await Promise.all([getOKRs(), getAllAgents()]);

  if (!okrs) {
    return (
      <div className="p-4">
        <p className="text-sm text-zinc-500">ยังไม่มี OKR ตั้งไว้</p>
      </div>
    );
  }

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">🎯 OKRs {okrs.year}</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {okrs.objectives.length} objectives · อัพเดทล่าสุด {okrs.last_updated}
        </p>
      </header>

      <div className="px-4 py-4 space-y-4">
        {okrs.objectives.map((o) => {
          const ownerSlugs = o.owner_agents ?? (o.owner_agent ? [o.owner_agent] : []);
          const owners = ownerSlugs
            .map((s) => agentBySlug.get(s))
            .filter(Boolean);

          return (
            <section key={o.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase">
                    {o.id}
                  </p>
                  <h2 className="text-base font-bold leading-tight mt-0.5">
                    {o.title}
                  </h2>
                </div>
                <span className="text-2xl font-bold tabular shrink-0">
                  {o.progress_percent}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                  style={{ width: `${o.progress_percent}%` }}
                />
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                <span className="font-semibold">เป้า:</span> {o.target}
              </p>

              {o.deadline && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-2">
                  📅 deadline: {o.deadline}
                </p>
              )}

              {owners.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {owners.map((a) =>
                    a ? (
                      <Link
                        key={a.slug}
                        href={`/agents/${a.slug}`}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        {a.emoji} {a.name}
                      </Link>
                    ) : null
                  )}
                </div>
              )}

              {/* Key Results */}
              {o.key_results.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                    Key Results
                  </p>
                  <ul className="space-y-2">
                    {o.key_results.map((kr) => {
                      const pct = Math.min(
                        100,
                        kr.target > 0 ? (kr.current / kr.target) * 100 : 0
                      );
                      return (
                        <li key={kr.id}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-mono text-[10px] text-zinc-500">
                              {kr.id}
                            </span>
                            <span className="tabular">
                              <span className="font-bold">{kr.current}</span>
                              <span className="text-zinc-400"> / {kr.target}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
                            {kr.metric}
                          </p>
                          <div className="h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
