import { listDir, readFile } from "@/lib/github";
import Link from "next/link";

export const revalidate = 300;

type SearchResult = {
  type: "brief" | "research" | "lesson" | "workout" | "reflection" | "project";
  title: string;
  path: string;
  snippet: string;
  date?: string;
};

const TYPE_LABEL: Record<string, { icon: string; label: string }> = {
  brief: { icon: "🌅", label: "Brief" },
  research: { icon: "📊", label: "Research" },
  lesson: { icon: "📚", label: "บทเรียน" },
  workout: { icon: "🏋️", label: "Workout" },
  reflection: { icon: "📝", label: "Reflection" },
  project: { icon: "🛠️", label: "Project" },
};

async function searchInDir(
  dir: string,
  type: SearchResult["type"],
  query: string,
  results: SearchResult[]
): Promise<void> {
  try {
    const files = await listDir(dir);
    for (const f of files) {
      if (f.type === "dir") {
        await searchInDir(f.path, type, query, results);
        continue;
      }
      if (!f.name.endsWith(".md")) continue;
      try {
        const content = await readFile(f.path);
        const lower = content.toLowerCase();
        const q = query.toLowerCase();
        if (lower.includes(q)) {
          const idx = lower.indexOf(q);
          const start = Math.max(0, idx - 50);
          const end = Math.min(content.length, idx + q.length + 50);
          const snippet = content.slice(start, end).replace(/\n/g, " ");
          results.push({
            type,
            title: f.name.replace(".md", ""),
            path: f.path,
            snippet: `...${snippet}...`,
            date: f.name.match(/^\d{4}-\d{2}-\d{2}/)?.[0],
          });
          if (results.length > 30) return;
        }
      } catch {}
    }
  } catch {}
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let results: SearchResult[] = [];
  if (query.length >= 2) {
    await Promise.all([
      searchInDir("stocks/daily-news", "brief", query, results),
      searchInDir("stocks/research", "research", query, results),
      searchInDir("stocks/lessons", "lesson", query, results),
      searchInDir("crypto", "lesson", query, results),
      searchInDir("webdev", "lesson", query, results),
      searchInDir("english", "lesson", query, results),
      searchInDir("fitness/workouts", "workout", query, results),
      searchInDir("reflections", "reflection", query, results),
      searchInDir("projects", "project", query, results),
    ]);
    results = results.slice(0, 30);
  }

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">ค้นหา</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          briefs / lessons / research / workouts / reflections
        </p>
      </header>

      <form action="/search" method="get" className="px-4 pt-4">
        <input
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="พิมพ์คำที่อยากค้น..."
          className="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 outline-none text-sm focus:ring-2 focus:ring-blue-500"
        />
      </form>

      <div className="px-4 py-4">
        {query.length < 2 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            พิมพ์อย่างน้อย 2 ตัวอักษร
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            ไม่พบสิ่งที่ค้นหา <code className="font-mono text-xs">{query}</code>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-500 mb-3 px-1">
              พบ {results.length} รายการ
            </p>
            <ul className="space-y-2">
              {results.map((r, i) => {
                const meta = TYPE_LABEL[r.type];
                return (
                  <li key={i} className="card p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{meta.icon}</span>
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                        {meta.label}
                      </span>
                      {r.date && (
                        <span className="text-[10px] text-zinc-400 ml-auto">
                          {r.date}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-tight">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                      {r.snippet}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                      {r.path}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
