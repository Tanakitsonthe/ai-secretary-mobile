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

const QUICK_LINKS = [
  { href: "/chat", icon: "💬", title: "Chat", subtitle: "8 agents" },
  { href: "/briefs", icon: "🌅", title: "Brief", subtitle: "ทุกเช้า" },
  { href: "/lessons", icon: "📚", title: "เรียน", subtitle: "Stock / Web / EN" },
  { href: "/fitness", icon: "💪", title: "Fitness", subtitle: "80 → 65 kg" },
];

export default async function HomePage() {
  const today = todayBkkDate();
  let brief: Awaited<ReturnType<typeof getTodayBrief>> | null = null;
  let error: string | null = null;

  try {
    brief = await getTodayBrief();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      {/* Hero */}
      <header className="px-5 pt-8 pb-5">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tabular tracking-wide uppercase">
          {today}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          สวัสดี{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
            NUT
          </span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          AI Secretary พร้อมแล้ว
        </p>
      </header>

      {/* Quick links — 2x2 grid */}
      <section className="px-5 grid grid-cols-2 gap-3">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="card p-4 active:scale-[0.98] transition-transform"
          >
            <div className="text-2xl">{q.icon}</div>
            <p className="mt-2 font-semibold text-sm">{q.title}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {q.subtitle}
            </p>
          </Link>
        ))}
      </section>

      {/* Today's brief */}
      <section className="mt-6 mx-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            Today&apos;s Brief
          </h2>
          <Link
            href="/briefs"
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        {error && (
          <div className="card p-4 border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30">
            <p className="text-sm text-red-700 dark:text-red-300">⚠ {error}</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
              ตรวจ GITHUB_TOKEN ใน Vercel
            </p>
          </div>
        )}

        {!error && brief?.content && (
          <div className="card overflow-hidden">
            {brief.isFallback && (
              <div className="px-4 py-2.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200">
                Brief วันนี้ยังไม่มา — แสดงล่าสุด {brief.date}
              </div>
            )}
            <MarkdownView content={brief.content} />
          </div>
        )}

        {!error && !brief?.content && (
          <div className="card p-8 text-center">
            <div className="text-3xl mb-2">🌙</div>
            <p className="text-sm font-medium">ยังไม่มี brief วันนี้</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Routine ทำงานทุกเช้า 07:20 BKK
            </p>
          </div>
        )}
      </section>

      <p className="mt-8 px-5 text-center text-[10px] text-zinc-400 dark:text-zinc-600">
        Built for NUT • powered by Claude
      </p>
    </div>
  );
}
