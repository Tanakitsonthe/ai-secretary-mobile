import { listDir } from "@/lib/github";
import Link from "next/link";

export const revalidate = 300;

export default async function WorkoutsListPage() {
  let workouts: { name: string; path: string }[] = [];
  let error: string | null = null;

  try {
    const files = await listDir("fitness/workouts");
    workouts = files
      .filter((f) => f.type === "file" && f.name.endsWith(".md"))
      .map((f) => ({ name: f.name.replace(".md", ""), path: f.path }))
      .sort((a, b) => b.name.localeCompare(a.name));
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/fitness" className="text-blue-600 dark:text-blue-400">←</Link>
        <div>
          <h1 className="text-sm font-bold">🏋️ Workouts History</h1>
          <p className="text-xs text-zinc-500">{workouts.length} sessions</p>
        </div>
      </header>

      {error && (
        <div className="m-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
          ⚠ {error}
        </div>
      )}

      {workouts.length === 0 && !error && (
        <div className="m-4 p-6 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-center text-zinc-500">
          ยังไม่มี workout history — จะมีหลังออกครั้งแรก
        </div>
      )}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {workouts.map((w) => (
          <li key={w.path}>
            <Link
              href={`/fitness/workout/${w.name}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <span className="font-medium">{w.name}</span>
              <span className="text-zinc-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
