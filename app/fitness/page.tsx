import { listDir, readFile, todayBkkDate } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";

export const revalidate = 300;

async function getDayWorkout() {
  const today = todayBkkDate();
  try {
    const content = await readFile(`fitness/workouts/${today}.md`);
    return { content, date: today, found: true };
  } catch {
    return { content: null, date: today, found: false };
  }
}

export default async function FitnessHomePage() {
  let plan: string | null = null;
  let workout: Awaited<ReturnType<typeof getDayWorkout>> | null = null;
  let error: string | null = null;

  try {
    workout = await getDayWorkout();
    try {
      plan = await readFile("fitness/plan.md");
    } catch {}
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">💪 Fitness</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          เทรนเนอร์ส่วนตัว — 80 → 65 kg journey
        </p>
      </header>

      {error && (
        <div className="m-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
          ⚠ {error}
        </div>
      )}

      <section className="m-4 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 border border-rose-200 dark:border-rose-900">
        <h2 className="font-semibold mb-2">🔥 Today&apos;s Workout</h2>
        {workout?.content ? (
          <p className="text-sm">
            <Link href={`/fitness/today`} className="text-blue-600 dark:text-blue-400">
              ดู workout วันนี้ ({workout.date}) →
            </Link>
          </p>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ดู <Link href="/fitness/plan" className="text-blue-600 dark:text-blue-400">plan</Link> เพื่อดูว่าวันนี้ต้องออกท่าอะไร
            <br />
            <span className="text-xs">(routine จะ generate daily workout ทีหลัง)</span>
          </p>
        )}
      </section>

      <section className="m-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold mb-3">📋 หน้าหลัก</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/fitness/plan" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 hover:scale-105 transition">
            🎯 4-Week Plan
          </Link>
          <Link href="/fitness/nutrition" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 hover:scale-105 transition">
            🍽️ Nutrition Guide
          </Link>
          <Link href="/fitness/progress" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 hover:scale-105 transition">
            📊 Progress Log
          </Link>
          <Link href="/fitness/workouts" className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 hover:scale-105 transition">
            🏋️ Workouts History
          </Link>
        </div>
      </section>

      {plan && (
        <details className="m-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <summary className="font-semibold cursor-pointer">📅 Quick view: Plan</summary>
          <div className="mt-3">
            <MarkdownView content={plan} />
          </div>
        </details>
      )}
    </div>
  );
}
