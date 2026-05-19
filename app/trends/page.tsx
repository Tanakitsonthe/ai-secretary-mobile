import {
  getWorkoutStreak,
  getReflectionStreak,
  getBriefStreak,
  getReflectionHistory,
  type StreakInfo,
  type ReflectionData,
} from "@/lib/streaks";

export const revalidate = 300;

const MOOD_EMOJI: Record<string, string> = {
  energized: "⚡",
  focused: "🎯",
  neutral: "😐",
  tired: "😪",
  stressed: "😣",
};

export default async function TrendsPage() {
  const [workout, reflection, brief, history] = await Promise.all([
    getWorkoutStreak(),
    getReflectionStreak(),
    getBriefStreak(),
    getReflectionHistory(),
  ]);

  const last30 = history.slice(-30);

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">นิสัย + แนวโน้ม</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          วันต่อเนื่อง + พลังงานสะสม
        </p>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Streaks */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
            🔥 วันต่อเนื่อง
          </h2>
          <div className="space-y-2">
            <StreakCard
              icon="🏋️"
              label="ออกกำลังกาย"
              streak={workout}
              gradient="from-orange-100 to-red-100 dark:from-orange-950/40 dark:to-red-950/40"
            />
            <StreakCard
              icon="📝"
              label="ทบทวนก่อนนอน"
              streak={reflection}
              gradient="from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40"
            />
            <StreakCard
              icon="🌅"
              label="อ่าน brief"
              streak={brief}
              gradient="from-blue-100 to-sky-100 dark:from-blue-950/40 dark:to-sky-950/40"
            />
          </div>
        </section>

        {/* Energy chart */}
        {last30.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
              ⚡ พลังงาน {last30.length} วันล่าสุด
            </h2>
            <div className="card p-4">
              <EnergyChart data={last30} />
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-[11px] text-zinc-500">
                <span>
                  เฉลี่ย{" "}
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {(
                      last30.reduce((s, r) => s + r.energy, 0) / last30.length
                    ).toFixed(1)}
                    /10
                  </span>
                </span>
                <span>
                  สูงสุด{" "}
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {Math.max(...last30.map((r) => r.energy))}/10
                  </span>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Mood breakdown */}
        {last30.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
              😊 อารมณ์
            </h2>
            <MoodBreakdown data={last30} />
          </section>
        )}

        {last30.length === 0 && (
          <div className="card p-6 text-center text-sm text-zinc-500">
            <p className="text-2xl mb-2">📊</p>
            ยังไม่มีข้อมูล reflection
            <p className="text-[11px] mt-1">
              ลอง <a href="/reflect" className="text-blue-600 dark:text-blue-400 underline">ทบทวนวันนี้</a> ก่อนนอนสักพัก แล้วกลับมาดูกราฟ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StreakCard({
  icon,
  label,
  streak,
  gradient,
}: {
  icon: string;
  label: string;
  streak: StreakInfo;
  gradient: string;
}) {
  return (
    <div
      className={`card p-4 bg-gradient-to-br ${gradient} flex items-center gap-4`}
    >
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
          ทำมาแล้ว {streak.total} วันรวม
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl font-bold tabular">{streak.current}</span>
          <span className="text-[11px] text-zinc-500">🔥</span>
        </div>
        <p className="text-[10px] text-zinc-500">
          สูงสุด {streak.longest} วัน
        </p>
      </div>
    </div>
  );
}

function EnergyChart({ data }: { data: ReflectionData[] }) {
  const max = 10;
  const w = 100;
  const h = 60;
  const step = data.length > 1 ? w / (data.length - 1) : 0;
  const points = data
    .map((d, i) => `${i * step},${h - (d.energy / max) * h}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area */}
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill="url(#grad)"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="rgb(59 130 246)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={h - (d.energy / max) * h}
          r="1"
          fill="rgb(59 130 246)"
        />
      ))}
    </svg>
  );
}

function MoodBreakdown({ data }: { data: ReflectionData[] }) {
  const counts: Record<string, number> = {};
  for (const d of data) counts[d.mood] = (counts[d.mood] ?? 0) + 1;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
      {entries.map(([mood, count]) => {
        const pct = (count / data.length) * 100;
        return (
          <li key={mood} className="px-4 py-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium flex items-center gap-1.5">
                <span>{MOOD_EMOJI[mood] ?? "•"}</span>
                <span>{mood}</span>
              </span>
              <span className="text-zinc-500 tabular">
                {count} วัน · {pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
