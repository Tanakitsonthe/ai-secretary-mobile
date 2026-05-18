import { listDir, readFile } from "@/lib/github";
import MarkdownView from "@/components/MarkdownView";
import Link from "next/link";

export const revalidate = 300;

export default async function WeeklyProjectPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  let content: string | null = null;
  let error: string | null = null;
  let files: { name: string }[] = [];

  try {
    const dir = await listDir(`projects/weekly-experiments/${name}`);
    files = dir.filter((f) => f.type === "file");
    try {
      content = await readFile(`projects/weekly-experiments/${name}/README.md`);
    } catch {
      content = null;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <Link href="/projects" className="text-blue-600 dark:text-blue-400">←</Link>
        <div>
          <p className="text-xs text-zinc-500">Weekly Experiment</p>
          <h1 className="text-sm font-bold">{name}</h1>
        </div>
      </header>
      {error && (
        <div className="m-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 text-sm text-red-700 dark:text-red-300">
          ⚠ {error}
        </div>
      )}
      {content && <MarkdownView content={content} />}
      {files.length > 0 && (
        <section className="m-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold mb-2">📁 ไฟล์ทั้งหมด</h2>
          <ul className="text-xs space-y-1">
            {files.map((f) => (
              <li key={f.name} className="text-zinc-600 dark:text-zinc-400">• {f.name}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
