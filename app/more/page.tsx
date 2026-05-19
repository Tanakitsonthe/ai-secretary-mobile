import Link from "next/link";

const sections = [
  {
    title: "Company",
    items: [
      { href: "/okrs", title: "🎯 OKRs", desc: "เป้าหมายปี 2026" },
      { href: "/budget", title: "💸 Budget", desc: "Token / ค่าใช้จ่าย" },
      { href: "/org", title: "🏢 Org Chart", desc: "ทีมงาน AI ทั้งหมด" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/briefs", title: "🌅 Briefs", desc: "Daily morning briefs" },
      { href: "/lessons", title: "📚 Lessons", desc: "Stock / Web / English / Crypto" },
      { href: "/research", title: "📊 Research", desc: "NVDA / BTC / Gold reports" },
      { href: "/projects", title: "🛠️ Projects", desc: "Weekly experiments + portfolio" },
    ],
  },
];

export default function MorePage() {
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
                    <div>
                      <p className="font-medium text-sm">{it.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {it.desc}
                      </p>
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
