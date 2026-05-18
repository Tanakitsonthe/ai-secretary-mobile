import { listDir } from "@/lib/github";
import Link from "next/link";

export const revalidate = 300;

const TRACKS = [
  { id: "stocks", label: "📈 Stock", color: "from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40" },
  { id: "crypto", label: "₿ Crypto", color: "from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40" },
  { id: "webdev", label: "💻 Web Dev", color: "from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40" },
  { id: "english", label: "🇬🇧 English", color: "from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40" },
];

async function getTrack(track: string) {
  try {
    const files = await listDir(`${track}/lessons`);
    return files
      .filter((f) => f.type === "file" && f.name.endsWith(".md"))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default async function LessonsPage() {
  const tracks = await Promise.all(
    TRACKS.map(async (t) => ({ ...t, files: await getTrack(t.id) }))
  );

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">📚 บทเรียน</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">เลือกหัวข้อที่อยากเรียน</p>
      </header>

      <div className="p-4 space-y-4">
        {tracks.map((t) => (
          <section
            key={t.id}
            className={`rounded-xl bg-gradient-to-br ${t.color} border border-zinc-200 dark:border-zinc-800 p-4`}
          >
            <h2 className="font-semibold mb-3">{t.label}</h2>
            {t.files.length === 0 ? (
              <p className="text-sm text-zinc-500">ยังไม่มีบทเรียน</p>
            ) : (
              <ul className="space-y-2">
                {t.files.map((f) => {
                  const slug = f.name.replace(".md", "");
                  return (
                    <li key={f.path}>
                      <Link
                        href={`/lessons/${t.id}/${slug}`}
                        className="block rounded-lg bg-white dark:bg-zinc-900 px-3 py-2 hover:scale-[1.02] transition text-sm"
                      >
                        {slug}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
