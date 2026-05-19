import { getTodayActivity, getAllAgents } from "@/lib/company";
import { formatTimeAgo } from "@/lib/labels";
import { listDir, readFile, todayBkkDate } from "@/lib/github";

export const revalidate = 60;

type RoutineInfo = {
  name: string;
  agent: string;
  schedule: string;
  promptFile: string;
  status: "healthy" | "stale" | "unknown";
  lastEvent?: string;
  lastTs?: string;
};

const ROUTINES: { name: string; agent: string; schedule: string; promptFile: string }[] = [
  {
    name: "Daily Brief",
    agent: "daily-briefer",
    schedule: "ทุกวัน 07:20 BKK",
    promptFile: "daily-briefer-prompt.md",
  },
  {
    name: "Report Refresh",
    agent: "stock-researcher",
    schedule: "ทุกวัน 07:08 BKK",
    promptFile: "report-refresh-prompt.md",
  },
  {
    name: "Weekly Mini Project",
    agent: "project-builder",
    schedule: "ทุกอาทิตย์ 09:02 BKK",
    promptFile: "weekly-mini-project-prompt.md",
  },
  {
    name: "Fitness Daily Workout",
    agent: "fitness-trainer",
    schedule: "ทุกวัน 06:00 BKK (รอ NUT สร้างบน claude.ai)",
    promptFile: "fitness-daily-prompt.md",
  },
];

async function getRoutinePrompts(): Promise<Set<string>> {
  try {
    const files = await listDir("company/routines");
    return new Set(files.filter((f) => f.type === "file").map((f) => f.name));
  } catch {
    return new Set();
  }
}

export default async function RoutinesHealthPage() {
  const today = todayBkkDate();
  const [activity, agents, promptFiles] = await Promise.all([
    getTodayActivity(),
    getAllAgents(),
    getRoutinePrompts(),
  ]);

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));

  const enriched: RoutineInfo[] = ROUTINES.map((r) => {
    const events = activity
      .filter((e) => e.agent === r.agent)
      .sort((a, b) => b.ts.localeCompare(a.ts));
    const lastEvent = events[0];
    const status: RoutineInfo["status"] = !lastEvent
      ? "unknown"
      : lastEvent.ts.startsWith(today)
      ? "healthy"
      : "stale";

    return {
      ...r,
      status,
      lastEvent: lastEvent?.event,
      lastTs: lastEvent?.ts,
    };
  });

  const STATUS_COLOR: Record<RoutineInfo["status"], string> = {
    healthy: "bg-green-500",
    stale: "bg-amber-500",
    unknown: "bg-zinc-400",
  };

  const STATUS_LABEL: Record<RoutineInfo["status"], string> = {
    healthy: "ทำงานปกติ",
    stale: "ไม่ได้รันวันนี้",
    unknown: "ยังไม่มีข้อมูล",
  };

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">สถานะ Routines</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          งานอัตโนมัติทั้งหมด · เช็คว่ารันสำเร็จไหม
        </p>
      </header>

      <ul className="px-4 py-4 space-y-2.5">
        {enriched.map((r) => {
          const agent = agentBySlug.get(r.agent);
          const hasPrompt = promptFiles.has(r.promptFile);
          return (
            <li key={r.name} className="card p-4">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLOR[r.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {agent && <span>{agent.emoji} {agent.name} · </span>}
                    {r.schedule}
                  </p>
                  <p className="text-[11px] mt-1.5">
                    <span className="text-zinc-500">สถานะ:</span>{" "}
                    <span className="font-medium">{STATUS_LABEL[r.status]}</span>
                    {r.lastTs && (
                      <span className="text-zinc-400"> · ครั้งล่าสุด {formatTimeAgo(r.lastTs)}</span>
                    )}
                  </p>
                  <p className="text-[10px] mt-1">
                    {hasPrompt ? (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ มี prompt template
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        ⚠ ไม่มี prompt
                      </span>
                    )}
                    <span className="text-zinc-400 font-mono ml-1">
                      ({r.promptFile})
                    </span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-4 pb-8 text-center text-[11px] text-zinc-500">
        Prompts อยู่ที่ <code className="font-mono">company/routines/</code> ใน
        AI-Secretary repo
      </div>
    </div>
  );
}
