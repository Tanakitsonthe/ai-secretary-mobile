import { getAllMessages, getAllAgents } from "@/lib/company";
import { PRIORITY_TH, PRIORITY_DOT, formatTimeAgo } from "@/lib/labels";
import Avatar from "@/components/Avatar";

export const revalidate = 60;

export default async function MessagesPage() {
  const [messages, agents] = await Promise.all([
    getAllMessages(),
    getAllAgents(),
  ]);

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));
  const getPerson = (slug: string) => {
    if (slug === "ceo") return { emoji: "👑", name: "คุณ (CEO)" };
    const a = agentBySlug.get(slug);
    return a ? { emoji: a.emoji, name: a.name } : { emoji: "❓", name: slug };
  };

  const unreadCount = messages.filter((m) => !m.read && m.to === "ceo").length;

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          ข้อความ
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
              {unreadCount} ใหม่
            </span>
          )}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          ระหว่างทีมงาน · {messages.length} ทั้งหมด
        </p>
      </header>

      {messages.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">ยังไม่มีข้อความ</p>
          <p className="text-[11px] mt-1">
            ทีมงานจะคุยกันเองเมื่อมีงานต้องประสาน
          </p>
        </div>
      )}

      <ul className="px-4 py-4 space-y-2.5">
        {messages.map((m) => {
          const from = getPerson(m.from);
          const to = getPerson(m.to);
          return (
            <li key={m.id} className="card p-4">
              <div className="flex items-start gap-3">
                <Avatar emoji={from.emoji} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap text-[11px]">
                    <span className="font-semibold text-sm">{from.name}</span>
                    <span className="text-zinc-400">→</span>
                    <span className="text-zinc-600 dark:text-zinc-400">{to.name}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[m.priority]}`}
                      title={PRIORITY_TH[m.priority]}
                    />
                    {!m.read && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        ใหม่
                      </span>
                    )}
                    <span className="ml-auto text-zinc-400">
                      {formatTimeAgo(m.ts)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug">{m.subject}</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed">
                    {m.body}
                  </p>
                  {m.attachments.length > 0 && (
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {m.attachments.map((a) => (
                        <span
                          key={a}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800"
                        >
                          📎 {a.split("/").pop()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
