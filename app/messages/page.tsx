import { getAllMessages, getAllAgents } from "@/lib/company";
import Link from "next/link";

export const revalidate = 60;

const PRIORITY_COLOR: Record<string, string> = {
  P0: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  P1: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  P2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  P3: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
};

export default async function MessagesPage() {
  const [messages, agents] = await Promise.all([
    getAllMessages(),
    getAllAgents(),
  ]);

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));
  const getName = (slug: string) => {
    if (slug === "ceo") return { emoji: "👑", name: "CEO" };
    const a = agentBySlug.get(slug);
    return a ? { emoji: a.emoji, name: a.name } : { emoji: "❓", name: slug };
  };

  const unreadCount = messages.filter((m) => !m.read && m.to === "ceo").length;

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">
          💌 Messages
          {unreadCount > 0 && (
            <span className="ml-2 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
              {unreadCount} ใหม่
            </span>
          )}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          ข้อความระหว่าง agents · {messages.length} ทั้งหมด
        </p>
      </header>

      {messages.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">ยังไม่มีข้อความ</p>
          <p className="text-[11px] mt-1">
            agents จะคุยกันเองเมื่อมีงานที่ต้องประสาน
          </p>
        </div>
      )}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {messages.map((m) => {
          const from = getName(m.from);
          const to = getName(m.to);
          return (
            <li key={m.id}>
              <article className="px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-900/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{from.emoji}</span>
                  <span className="text-xs font-medium">{from.name}</span>
                  <span className="text-zinc-400 text-xs">→</span>
                  <span className="text-base">{to.emoji}</span>
                  <span className="text-xs font-medium">{to.name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      PRIORITY_COLOR[m.priority]
                    }`}
                  >
                    {m.priority}
                  </span>
                  {!m.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                  <span className="ml-auto text-[10px] text-zinc-400 tabular">
                    {m.ts.slice(11, 16)}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug">{m.subject}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {m.body}
                </p>
                {m.attachments.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {m.attachments.map((a) => (
                      <span
                        key={a}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono"
                      >
                        📎 {a.split("/").pop()}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      <div className="m-4 mb-8 text-center">
        <Link
          href="/messages/schema"
          className="text-[11px] text-zinc-400 hover:underline"
        >
          ดู schema ของ messages
        </Link>
      </div>
    </div>
  );
}
