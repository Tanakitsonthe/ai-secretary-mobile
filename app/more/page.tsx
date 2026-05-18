import Link from "next/link";

const items = [
  {
    href: "/research",
    title: "📊 Research",
    desc: "NVDA / BTC / Gold reports",
  },
  {
    href: "/projects",
    title: "🛠️ Projects",
    desc: "Weekly experiments + portfolio + AI trading",
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

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="flex items-center justify-between px-4 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="font-medium">{it.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {it.desc}
                </p>
              </div>
              <span className="text-zinc-400">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
