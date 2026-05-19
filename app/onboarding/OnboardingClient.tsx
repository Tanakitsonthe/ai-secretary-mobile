"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SLIDES = [
  {
    emoji: "🏢",
    title: "ยินดีต้อนรับสู่ NUT Inc.",
    body: "นี่คือ AI Secretary ของคุณ — มี 12 พนักงาน AI ทำงานให้คุณตลอดเวลา คุณคือ CEO",
    color: "from-blue-100 to-violet-100 dark:from-blue-950/30 dark:to-violet-950/30",
  },
  {
    emoji: "🤖",
    title: "พนักงานทำงานเอง",
    body: "ทุกเช้าจะมี brief สรุปข่าวให้ ทุก Sun มีโปรเจกต์ใหม่ ทีมเสนอ proposal — คุณแค่ ✓ / ✗",
    color: "from-emerald-100 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30",
  },
  {
    emoji: "💬",
    title: "พูดได้เพิ่มงานได้",
    body: "กด 'งาน' → 'เพิ่มงาน' หรือไป Quick Add กดไมค์ พูดอะไรก็ได้ภาษาไทย ทีมจะรับไปทำ",
    color: "from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30",
  },
  {
    emoji: "🚀",
    title: "พร้อมเริ่มแล้ว",
    body: "เปิดการแจ้งเตือนที่ Settings เพื่อให้พนักงานเด้งบอกเข้ามือถือ คุณพร้อมเป็น CEO หรือยัง?",
    color: "from-fuchsia-100 to-pink-100 dark:from-fuchsia-950/30 dark:to-pink-950/30",
  },
];

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const last = step === SLIDES.length - 1;

  function next() {
    if (last) {
      try {
        localStorage.setItem("nut_onboarded", "1");
      } catch {}
      router.push("/");
    } else {
      setStep((s) => s + 1);
    }
  }

  function skip() {
    try {
      localStorage.setItem("nut_onboarded", "1");
    } catch {}
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 pt-5 flex justify-between items-center">
        <p className="text-xs text-zinc-400 tabular">
          {step + 1} / {SLIDES.length}
        </p>
        <button
          onClick={skip}
          className="text-xs text-zinc-500 dark:text-zinc-400"
        >
          ข้าม
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-xl`}
        >
          <span className="text-6xl">{slide.emoji}</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight mb-3">{slide.title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xs">
          {slide.body}
        </p>
      </main>

      <footer className="px-8 pb-10 space-y-4">
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-blue-600 dark:bg-blue-500"
                  : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold active:scale-[0.98] transition-transform"
        >
          {last ? "เริ่มใช้งาน" : "ต่อไป"}
        </button>
      </footer>
    </div>
  );
}
