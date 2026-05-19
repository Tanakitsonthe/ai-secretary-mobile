"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "หน้าหลัก", icon: "🏠" },
  { href: "/tasks", label: "งาน", icon: "📋" },
  { href: "/org", label: "ทีม", icon: "🏢" },
  { href: "/chat", label: "คุย", icon: "💬" },
  { href: "/fitness", label: "ฟิตเนส", icon: "💪" },
  { href: "/more", label: "อื่นๆ", icon: "⋯" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-t border-zinc-200/60 dark:border-zinc-800/60 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <ul className="flex items-stretch px-1 pt-1.5">
        {items.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="relative flex flex-col items-center gap-0.5 py-1.5 group"
              >
                {active && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-blue-600 dark:bg-blue-500" />
                )}
                <span
                  className={`text-[20px] leading-none transition-transform duration-150 ${
                    active ? "scale-110" : "group-active:scale-95"
                  }`}
                >
                  {icon}
                </span>
                <span
                  className={`text-[10px] font-medium tracking-tight transition-colors ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-500 dark:text-zinc-500"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
