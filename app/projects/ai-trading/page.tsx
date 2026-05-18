import { readFile } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";

export const revalidate = 300;

export default async function AiTradingPage() {
  let content: string | null = null;
  let error: string | null = null;
  try {
    content = await readFile("projects/ai-trading-systemPro-assessment.md");
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/projects" className="text-blue-600 dark:text-blue-400">←</Link>
        <h1 className="text-sm font-bold">🤖 ai-trading-systemPro</h1>
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
