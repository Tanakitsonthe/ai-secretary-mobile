import { listDir } from "@/lib/github";
import Link from "next/link";

export const revalidate = 300;

const TRACKS = [
  { id: "stocks", label: "📈 Stock Research" },
  { id: "crypto", label: "₿ Crypto Research" },
  { id: "gold", label: "🪙 Gold Research" },
];

async function getTrack(track: string) {
  try {
    const files = await listDir(`${track}/research`);
    return files
      .filter((f) => f.type === "file" && f.name.endsWith(".md"))
      .sort((a, b) => b.name.localeCompare(a.name));
  } catch {
    return [];
  }
}

export default async function ResearchPage() {
  const tracks = await Promise.all(
    TRACKS.map(async (t) => ({ ...t, files: await getTrack(t.id) }))
  );

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">📊 Research</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">รายงานวิจัยทั้งหมด</p>
      </header>

      <div className="p-4 space-y-4">
        {tracks.map((t) => (
          <section
            key={t.id}
            className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4"
          >
            <h2 className="font-semibold mb-3">{t.label}</h2>
            {t.files.length === 0 ? (
              <p className="text-sm text-zinc-500">ยังไม่มี report</p>
            ) : (
              <ul className="space-y-2">
                {t.files.map((f) => {
                  const slug = f.name.replace(".md", "");
                  return (
                    <li key={f.path}>
                      <Link
                        href={`/research/${t.id}/${slug}`}
                        className="block rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2 hover:scale-[1.02] transition text-sm"
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
