import { readFile } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";

export const revalidate = 300;

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  let content: string | null = null;
  let error: string | null = null;

  try {
    content = await readFile(`stocks/daily-news/${date}.md`);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/briefs" className="text-blue-600 dark:text-blue-400">←</Link>
        <div>
          <h1 className="text-base font-bold">🌅 {date}</h1>
        </div>
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
