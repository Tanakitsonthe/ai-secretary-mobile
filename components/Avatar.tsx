import type { AgentStatus } from "@/lib/company";
import { AGENT_STATUS_DOT } from "@/lib/labels";

type Props = {
  emoji: string;
  status?: AgentStatus;
  size?: "sm" | "md" | "lg";
  gradient?: string;
};

const SIZE_MAP = {
  sm: { box: "w-8 h-8", text: "text-base", dot: "w-2 h-2" },
  md: { box: "w-10 h-10", text: "text-lg", dot: "w-2.5 h-2.5" },
  lg: { box: "w-14 h-14", text: "text-2xl", dot: "w-3 h-3" },
};

const GRADIENTS = [
  "from-blue-100 to-violet-100 dark:from-blue-950/40 dark:to-violet-950/40",
  "from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40",
  "from-amber-100 to-rose-100 dark:from-amber-950/40 dark:to-rose-950/40",
  "from-fuchsia-100 to-pink-100 dark:from-fuchsia-950/40 dark:to-pink-950/40",
  "from-sky-100 to-indigo-100 dark:from-sky-950/40 dark:to-indigo-950/40",
  "from-lime-100 to-green-100 dark:from-lime-950/40 dark:to-green-950/40",
  "from-orange-100 to-red-100 dark:from-orange-950/40 dark:to-red-950/40",
];

// Stable color per emoji by hashing
function pickGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

export default function Avatar({ emoji, status, size = "md", gradient }: Props) {
  const sz = SIZE_MAP[size];
  const grad = gradient ?? pickGradient(emoji);

  return (
    <div className="relative shrink-0">
      <div
        className={`${sz.box} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center ${sz.text} ring-2 ring-white dark:ring-zinc-900`}
      >
        <span aria-hidden>{emoji}</span>
      </div>
      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${sz.dot} rounded-full ${AGENT_STATUS_DOT[status]} ring-2 ring-white dark:ring-zinc-900`}
        />
      )}
    </div>
  );
}
