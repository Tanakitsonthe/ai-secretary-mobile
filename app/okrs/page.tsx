import { getOKRs, getAllAgents } from "@/lib/company";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export const revalidate = 300;

export default async function OKRsPage() {
  const [okrs, agents] = await Promise.all([getOKRs(), getAllAgents()]);

  if (!okrs) {
    return (
      <div className="p-4">
        <p className="text-sm text-zinc-500">ยังไม่มีเป้าหมายตั้งไว้</p>
      </div>
    );
  }

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">เป้าหมายปี {okrs.year}</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {okrs.objectives.length} เป้าหมายหลัก · อัพเดท {okrs.last_updated}
        </p>
      </header>

      <div className="px-4 py-4 space-y-4">
        {okrs.objectives.map((o, idx) => {
          const ownerSlugs = o.owner_agents ?? (o.owner_agent ? [o.owner_agent] : []);
          const owners = ownerSlugs
            .map((s) => agentBySlug.get(s))
            .filter(Boolean);

          return (
            <section key={o.id} className="card overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border-b border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  เป้าหมายที่ {idx + 1}
                </p>
                <div className="flex items-start justify-between gap-2 mt-0.5">
                  <h2 className="text-base font-bold leading-tight flex-1">
                    {o.title}
                  </h2>
                  <span className="text-2xl font-bold tabular shrink-0">
                    {o.progress_percent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                    style={{ width: `${o.progress_percent}%` }}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-3">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <span className="font-semibold">เป้า:</span> {o.target}
                </p>
                {o.deadline && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1.5">
                    📅 เดดไลน์ {o.deadline}
                  </p>
                )}

                {/* Owners */}
                {owners.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                      ผู้รับผิดชอบ
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {owners.map((a) =>
                        a ? (
                          <Link
                            key={a.slug}
                            href={`/agents/${a.slug}`}
                            className="flex items-center gap-1.5 text-[11px] pl-1 pr-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            <Avatar emoji={a.emoji} size="sm" />
                            <span className="font-medium">{a.name}</span>
                          </Link>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* Key Results */}
                {o.key_results.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                      ผลลัพธ์สำคัญ
                    </p>
                    <ul className="space-y-3">
                      {o.key_results.map((kr, krIdx) => {
                        const pct = Math.min(
                          100,
                          kr.target > 0 ? (kr.current / kr.target) * 100 : 0
                        );
                        return (
                          <li key={kr.id}>
                            <div className="flex items-center justify-between text-xs mb-1 gap-2">
                              <span className="text-zinc-700 dark:text-zinc-300 leading-snug flex-1">
                                {krIdx + 1}. {kr.metric}
                              </span>
                              <span className="tabular shrink-0">
                                <span className="font-bold">{kr.current}</span>
                                <span className="text-zinc-400"> / {kr.target}</span>
                              </span>
                            </div>
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
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
