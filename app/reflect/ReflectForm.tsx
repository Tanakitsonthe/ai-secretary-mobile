"use client";

import { useState } from "react";
import { saveReflection } from "./actions";

const MOODS = [
  { value: "energized", label: "⚡ พลังเต็ม" },
  { value: "focused", label: "🎯 โฟกัสได้" },
  { value: "neutral", label: "😐 เฉยๆ" },
  { value: "tired", label: "😪 เพลีย" },
  { value: "stressed", label: "😣 เครียด" },
];

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

export default function ReflectForm() {
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState("neutral");
  const [wentWell, setWentWell] = useState("");
  const [wentWrong, setWentWrong] = useState("");
  const [tomorrowFocus, setTomorrowFocus] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit() {
    setStatus({ kind: "saving" });
    const res = await saveReflection({
      energy,
      mood,
      went_well: wentWell.trim(),
      went_wrong: wentWrong.trim(),
      tomorrow_focus: tomorrowFocus.trim(),
    });
    if (res.ok) {
      setStatus({ kind: "saved" });
      setTimeout(() => setStatus({ kind: "idle" }), 3000);
    } else {
      setStatus({ kind: "error", message: res.error });
    }
  }

  return (
    <div className="space-y-4">
      {/* Energy slider */}
      <section className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">Energy วันนี้</label>
          <span className="text-2xl font-bold tabular">{energy}/10</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
          <span>หมด</span>
          <span>เต็ม</span>
        </div>
      </section>

      {/* Mood */}
      <section>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
          Mood
        </p>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`card p-2 text-center text-[10px] font-medium active:scale-95 ${
                mood === m.value
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : ""
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* Text fields */}
      <Field
        label="✅ ดี / สำเร็จ"
        value={wentWell}
        onChange={setWentWell}
        placeholder="เช่น &quot;ทำ webdev 2 ชม. ครบ ไม่ขี้เกียจ&quot;"
      />
      <Field
        label="⚠️ ติด / ผิดพลาด"
        value={wentWrong}
        onChange={setWentWrong}
        placeholder="เช่น &quot;นั่งเล่นเกม 3 ชม. เกิน plan&quot;"
      />
      <Field
        label="🎯 พรุ่งนี้โฟกัส"
        value={tomorrowFocus}
        onChange={setTomorrowFocus}
        placeholder="เช่น &quot;เริ่ม React lesson + 45 นาที workout&quot;"
      />

      {/* Submit */}
      <button
        onClick={submit}
        disabled={status.kind === "saving"}
        className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98]"
      >
        {status.kind === "saving" ? "กำลังบันทึก..." : "บันทึก reflection"}
      </button>

      {status.kind === "saved" && (
        <div className="card p-3 border-green-300 dark:border-green-900 bg-green-50/60 dark:bg-green-950/30 text-sm text-green-700 dark:text-green-300 text-center">
          ✓ บันทึกแล้ว ขอให้นอนหลับฝันดี
        </div>
      )}
      {status.kind === "error" && (
        <div className="card p-3 border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 text-sm text-red-700 dark:text-red-300">
          ⚠ {status.message}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <section>
      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1 block">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="card w-full p-3 bg-transparent text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
      />
    </section>
  );
}
