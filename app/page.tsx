import { listDir, readFile, todayBkkDate } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";

export const revalidate = 300;

async function getTodayBrief() {
  const today = todayBkkDate();
  try {
    const content = await readFile(`stocks/daily-news/${today}.md`);
    return { content, date: today, found: true, isFallback: false };
  } catch {
    const files = await listDir("stocks/daily-news");
    const briefs = files
      .filter((f) => f.type === "file" && f.name.endsWith(".md"))
      .sort((a, b) => b.name.localeCompare(a.name));
    if (briefs.length === 0) {
      return { content: null, date: today, found: false, isFallback: false };
    }
    const latest = briefs[0];
    const content = await readFile(latest.path);
    return {
      content,
      date: latest.name.replace(".md", ""),
      found: false,
      isFallback: true,
    };
  }
}

export default async function HomePage() {
  let brief: Awaited<ReturnType<typeof getTodayBrief>> | null = null;
  let error: string | null = null;

  try {
    brief = await getTodayBrief();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">🌅 Daily Brief</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          AI Secretary — สำหรับ NUT
        </p>
      </header>

      {error && (
        <div className="m-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900">
          <p className="text-sm text-red-700 dark:text-red-300">⚠ {error}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ตรวจ GITHUB_TOKEN ใน Vercel env vars
          </p>
        </div>
      )}

      {!error && brief?.content && (
        <>
          {brief.isFallback && (
            <div className="mx-4 mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-sm text-amber-800 dark:text-amber-200">
              ℹ Brief ของวันนี้ยังไม่มา — แสดง brief ล่าสุดวันที่ {brief.date}
            </div>
          )}
          <MarkdownView content={brief.content} />
        </>
      )}

      {!error && !brief?.content && (
        <div className="m-4 p-6 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            ยังไม่มี daily brief
          </p>
          <p className="text-xs mt-2 text-zinc-500">
            Routine จะสร้างให้ทุกเช้า 07:20 BKK
          </p>
        </div>
      )}

      <section className="m-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900">
        <h2 className="font-semibold mb-2">🚀 Quick Access</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/lessons" className="rounded-lg bg-white dark:bg-zinc-800 p-3 hover:scale-105 transition">
            📚 บทเรียน
          </Link>
          <Link href="/research" className="rounded-lg bg-white dark:bg-zinc-800 p-3 hover:scale-105 transition">
            📊 Research
          </Link>
          <Link href="/projects" className="rounded-lg bg-white dark:bg-zinc-800 p-3 hover:scale-105 transition">
            🛠️ Projects
          </Link>
          <Link href="/briefs" className="rounded-lg bg-white dark:bg-zinc-800 p-3 hover:scale-105 transition">
            🌅 Brief History
          </Link>
        </div>
      </section>
    </div>
  );
}
