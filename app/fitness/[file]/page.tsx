import { readFile, todayBkkDate } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

const ALLOWED: Record<string, { path: string; title: string }> = {
  plan: { path: "fitness/plan.md", title: "🎯 4-Week Plan" },
  nutrition: { path: "fitness/nutrition.md", title: "🍽️ Nutrition Guide" },
  progress: { path: "fitness/progress.md", title: "📊 Progress Log" },
};

export default async function FitnessDocPage({
  params,
}: {
  params: Promise<{ file: string }>;
}) {
  const { file } = await params;

  if (file === "today") {
    const today = todayBkkDate();
    let content: string | null = null;
    let err: string | null = null;
    try {
      content = await readFile(`fitness/workouts/${today}.md`);
    } catch (e) {
      err = e instanceof Error ? e.message : "Unknown error";
    }
    return (
      <div>
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
          <Link href="/fitness" className="text-blue-600 dark:text-blue-400">←</Link>
          <h1 className="text-sm font-bold">🔥 Workout — {today}</h1>
        </header>
        {err ? (
          <div className="m-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950 text-sm text-amber-800 dark:text-amber-200">
            ยังไม่มี workout สำหรับวันนี้ — ดู <Link href="/fitness/plan" className="text-blue-600 dark:text-blue-400 underline">plan</Link> เพื่อรู้ว่าวันนี้ต้องออกท่าอะไร
          </div>
        ) : content ? (
          <MarkdownView content={content} />
        ) : null}
      </div>
    );
  }

  const entry = ALLOWED[file];
  if (!entry) notFound();

  let content: string | null = null;
  let error: string | null = null;
  try {
    content = await readFile(entry.path);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/fitness" className="text-blue-600 dark:text-blue-400">←</Link>
        <h1 className="text-sm font-bold">{entry.title}</h1>
      </header>
      {error && (
        <div className="m-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
          ⚠ {error}
        </div>
      )}
      {content && <MarkdownView content={content} />}
    </div>
  );
}
