import { getPendingProposals, getAllMessages } from "@/lib/company";
import Link from "next/link";

export const revalidate = 60;

export default async function MorePage() {
  const [pending, messages] = await Promise.all([
    getPendingProposals(),
    getAllMessages(),
  ]);
  const unread = messages.filter((m) => !m.read && m.to === "ceo").length;

  const sections = [
    {
      title: "Company",
      items: [
        {
          href: "/proposals",
          title: "✋ Proposals",
          desc: "คำขออนุมัติจากพนักงาน",
          badge: pending.length > 0 ? `${pending.length}` : null,
          badgeColor: "bg-amber-500",
        },
        {
          href: "/messages",
          title: "💌 Messages",
          desc: "ข้อความระหว่าง agents",
          badge: unread > 0 ? `${unread}` : null,
          badgeColor: "bg-red-500",
        },
        { href: "/okrs", title: "🎯 OKRs", desc: "เป้าหมายปี 2026", badge: null, badgeColor: "" },
        { href: "/budget", title: "💸 Budget", desc: "Token / ค่าใช้จ่าย", badge: null, badgeColor: "" },
        { href: "/org", title: "🏢 Org Chart", desc: "ทีมงาน AI ทั้งหมด", badge: null, badgeColor: "" },
      ],
    },
    {
      title: "Quick Actions",
      items: [
        {
          href: "/quick",
          title: "⚡ Quick Add Task",
          desc: "พูดหรือพิมพ์ — สร้าง task เร็ว",
          badge: null,
          badgeColor: "",
        },
        {
          href: "/reflect",
          title: "📝 Daily Reflection",
          desc: "ทบทวนวันนี้ก่อนนอน",
          badge: null,
          badgeColor: "",
        },
        {
          href: "/activity",
          title: "⏱ Activity",
          desc: "เหตุการณ์ของทีมวันนี้",
          badge: null,
          badgeColor: "",
        },
        {
          href: "/health",
          title: "🩺 Health Check",
          desc: "ตรวจระบบ + env vars",
          badge: null,
          badgeColor: "",
        },
        {
          href: "/settings",
          title: "⚙️ Settings",
          desc: "Push notifications + CEO profile",
          badge: null,
          badgeColor: "",
        },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/briefs", title: "🌅 Briefs", desc: "Daily morning briefs", badge: null, badgeColor: "" },
        { href: "/lessons", title: "📚 Lessons", desc: "Stock / Web / English / Crypto", badge: null, badgeColor: "" },
        { href: "/research", title: "📊 Research", desc: "NVDA / BTC / Gold reports", badge: null, badgeColor: "" },
        { href: "/projects", title: "🛠️ Projects", desc: "Weekly experiments + portfolio", badge: null, badgeColor: "" },
      ],
    },
  ];

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">⋯ More</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          พื้นที่อื่นๆ
        </p>
      </header>

      <div className="px-4 py-3 space-y-5">
        {sections.map((sec) => (
          <section key={sec.title}>
            <h2 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
              {sec.title}
            </h2>
            <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
              {sec.items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="flex items-center justify-between px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-sm">{it.title}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {it.desc}
                        </p>
                      </div>
                      {it.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${it.badgeColor}`}
                        >
                          {it.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
