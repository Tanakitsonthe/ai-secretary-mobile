import { listDir, readFile } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";

export const revalidate = 300;

export default async function ProjectsPage() {
  let weeklyItems: { name: string; path: string }[] = [];
  let assessmentContent: string | null = null;
  let trackerContent: string | null = null;
  let error: string | null = null;

  try {
    const weekly = await listDir("projects/weekly-experiments");
    weeklyItems = weekly
      .filter((f) => f.type === "dir")
      .map((f) => ({ name: f.name, path: f.path }))
      .sort((a, b) => b.name.localeCompare(a.name));

    try {
      assessmentContent = await readFile("projects/ai-trading-systemPro-assessment.md");
    } catch {}

    try {
      trackerContent = await readFile("projects/stock-portfolio-tracker/plan.md");
    } catch {}
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">🛠️ Projects</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          โปรเจกต์ + weekly experiments
        </p>
      </header>

      {error && (
        <div className="m-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
          ⚠ {error}
        </div>
      )}

      <div className="p-4 space-y-4">
        <section className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border border-purple-200 dark:border-purple-900 p-4">
          <h2 className="font-semibold mb-3">🧪 Weekly Experiments</h2>
          {weeklyItems.length === 0 ? (
            <p className="text-sm text-zinc-500">
              ยังไม่มี — รอวันอาทิตย์ 09:02 BKK
            </p>
          ) : (
            <ul className="space-y-2">
              {weeklyItems.map((w) => (
                <li key={w.path}>
                  <Link
                    href={`/projects/weekly/${w.name}`}
                    className="block rounded-lg bg-white dark:bg-zinc-900 px-3 py-2 hover:scale-[1.02] transition text-sm"
                  >
                    {w.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {trackerContent && (
          <section className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
            <h2 className="font-semibold mb-2">📈 Stock Portfolio Tracker</h2>
            <p className="text-xs text-zinc-500 mb-2">Plan + milestones</p>
            <Link
              href="/projects/portfolio-tracker"
              className="text-blue-600 dark:text-blue-400 text-sm"
            >
              อ่านแผนเต็ม →
            </Link>
          </section>
        )}

        {assessmentContent && (
          <section className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
            <h2 className="font-semibold mb-2">🤖 ai-trading-systemPro</h2>
            <p className="text-xs text-zinc-500 mb-2">Assessment + decision</p>
            <Link
              href="/projects/ai-trading"
              className="text-blue-600 dark:text-blue-400 text-sm"
            >
              อ่าน assessment →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
