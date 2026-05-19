import { getAllAgents, getDepartments } from "@/lib/company";
import Link from "next/link";

export const revalidate = 300;

const STATUS_DOT: Record<string, string> = {
  idle: "bg-zinc-400",
  working: "bg-green-500",
  blocked: "bg-amber-500",
  offline: "bg-zinc-300 dark:bg-zinc-700",
};

const STATUS_LABEL: Record<string, string> = {
  idle: "ว่าง",
  working: "ทำงาน",
  blocked: "ติด",
  offline: "ออฟไลน์",
};

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
        <h1 className="text-lg font-bold">🏢 Org Chart</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {agents.length} พนักงาน · {depts.length} แผนก
        </p>
      </header>

      {/* CEO node */}
      <div className="px-4 pt-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/40 dark:to-violet-950/40 border-blue-200 dark:border-blue-900">
          <p className="text-[10px] uppercase tracking-wide font-bold text-blue-700 dark:text-blue-300">
            CEO
          </p>
          <p className="text-lg font-bold mt-1">NUT (Tanakit)</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            ผู้ก่อตั้ง · ตัดสินใจสุดท้าย
          </p>
        </div>
      </div>

      {/* Departments */}
      <div className="px-4 pt-4 pb-8 space-y-4">
        {depts.map((d) => {
          const deptAgents = d.agents
            .map((slug) => agentBySlug.get(slug))
            .filter(Boolean);
          return (
            <section key={d.id}>
              <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-sm font-bold">
                  {d.emoji} {d.name}
                </h2>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">
                  {deptAgents.length} คน
                </span>
              </div>
              <ul className="space-y-2">
                {deptAgents.map((a) => {
                  if (!a) return null;
                  const isHead = d.head === a.slug;
                  return (
                    <li key={a.slug}>
                      <Link
                        href={`/agents/${a.slug}`}
                        className="card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
                      >
                        <span className="text-2xl">{a.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm">{a.name}</p>
                            {isHead && (
                              <span className="text-[9px] font-bold px-1 py-px rounded bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                HEAD
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {a.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`w-2 h-2 rounded-full ${STATUS_DOT[a.status]}`}
                          />
                          <span className="text-[10px] text-zinc-500">
                            {STATUS_LABEL[a.status]}
                          </span>
                        </div>
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
