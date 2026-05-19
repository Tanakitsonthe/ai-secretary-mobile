import { getTodayTasks, getAllAgents } from "@/lib/company";
import { suggestNext } from "@/lib/suggest";
import { PRIORITY_TH } from "@/lib/labels";
import Link from "next/link";

export default async function SuggestNext() {
  const [tasksFile, agents] = await Promise.all([
    getTodayTasks(),
    getAllAgents(),
  ]);

  const tasks = tasksFile?.tasks ?? [];
  const suggestion = suggestNext(tasks);

  if (!suggestion) return null;

  const agent = agents.find((a) => a.slug === suggestion.task.assigned_to);

  return (
    <Link
      href="/tasks"
      className="card p-4 bg-gradient-to-br from-violet-50 via-blue-50 to-sky-50 dark:from-violet-950/30 dark:via-blue-950/30 dark:to-sky-950/30 border-violet-200/60 dark:border-violet-900/60 block active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🤖</span>
        <p className="text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
          ทำอันนี้ต่อไหม?
        </p>
      </div>
      <p className="text-sm font-bold leading-snug">{suggestion.task.title}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-zinc-600 dark:text-zinc-400">
        {agent && (
          <span>
            {agent.emoji} {agent.name}
          </span>
        )}
        <span>· {PRIORITY_TH[suggestion.task.priority]}</span>
        {suggestion.task.estimated_minutes && (
          <span>· {suggestion.task.estimated_minutes} นาที</span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-violet-700 dark:text-violet-300 italic">
        เหตุผล: {suggestion.reason}
      </p>
    </Link>
  );
}
