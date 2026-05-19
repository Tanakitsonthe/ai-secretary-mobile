import { getAllAgents, getDepartments } from "@/lib/company";
import { AGENT_STATUS_TH } from "@/lib/labels";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export const revalidate = 300;

export default async function OrgChartPage() {
  const [departments, agents] = await Promise.all([
    getDepartments(),
    getAllAgents(),
  ]);

  const depts = departments?.departments ?? [];
  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">ทีมงาน</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {agents.length} คน · {depts.length} แผนก
        </p>
      </header>

      {/* CEO */}
      <div className="px-4 pt-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/40 dark:to-violet-950/40 border-blue-200/60 dark:border-blue-900/60 flex items-center gap-4">
          <Avatar emoji="👑" size="lg" gradient="from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              ผู้ก่อตั้ง
            </p>
            <p className="text-lg font-bold leading-tight">NUT</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              ตัดสินใจสุดท้าย
            </p>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="px-4 pt-5 pb-8 space-y-5">
        {depts.map((d) => {
          const deptAgents = d.agents
            .map((slug) => agentBySlug.get(slug))
            .filter(Boolean);
          return (
            <section key={d.id}>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <span>{d.emoji}</span>
                  <span>{d.name}</span>
                </h2>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                  {deptAgents.length} คน
                </span>
              </div>
              <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
                {deptAgents.map((a) => {
                  if (!a) return null;
                  const isHead = d.head === a.slug;
                  return (
                    <li key={a.slug}>
                      <Link
                        href={`/agents/${a.slug}`}
                        className="flex items-center gap-3 px-4 py-3 active:bg-zinc-50 dark:active:bg-zinc-800/50"
                      >
                        <Avatar emoji={a.emoji} status={a.status} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-sm">{a.name}</p>
                            {isHead && (
                              <span className="text-[9px] font-bold px-1.5 py-px rounded bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                หัวหน้า
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {a.role}
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {AGENT_STATUS_TH[a.status]}
                        </span>
                      </Link>
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
