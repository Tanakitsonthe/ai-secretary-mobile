import { NextResponse } from "next/server";
import { writeFile } from "@/lib/github";
import { callClaude } from "@/lib/claude";
import {
  todayBkk,
  bkkWeekday,
  setAgentStatus,
  appendActivity,
  upsertTask,
  touchState,
  addTokenUsage,
  sendPushIfSubscribed,
  getBaseUrl,
  isAuthorizedCron,
} from "@/lib/heartbeat";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are NUT's fitness-trainer. Write workout plan in Thai with English exercise names.
Tone: friendly coach. Cycle 1 plan (2026-05-19 → 2026-06-15):
- Mon: Full Body A (push) — Goblet squat, Push-up, One-arm row, Glute bridge, Plank
- Tue: Cardio + Core (30-40 min LISS)
- Wed: Full Body B (pull) — Reverse lunge, Towel row, DB curl, Superman
- Thu: Rest / walk 20 min
- Fri: Full Body C (legs) — Bulgarian split squat, RDL, Calf raise, Wall sit
- Sat: Cardio + Core
- Sun: Rest

Equipment: 1×5kg dumbbell + bodyweight only.
NUT: 80kg → 65kg goal, knee-friendly, home workout.`;

const USER = (today: string, weekday: string) => `วันที่ ${today} (${weekday})

สร้างไฟล์ workout วันนี้ตาม Cycle 1.
รูปแบบ:
\`\`\`
# 🏋️ {Workout name} — ${today}

## Warm-up (5 min)
- ...

## Main work
- Exercise: 3×12 — form cue ภาษาไทย

## Cool-down (5 min)
- ...

## ภารกิจวันนี้
- [ ] ทำตามแผน
- [ ] บันทึก reps จริง
- [ ] กินโปรตีน 130g

## โน้ตจากเทรนเนอร์
1-2 ประโยคให้กำลังใจ
\`\`\``;

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayBkk();
  const weekday = bkkWeekday();
  const taskId = "T-workout";

  try {
    await setAgentStatus("fitness-trainer", "working", taskId);
    await appendActivity("fitness-trainer", "task_start", { task_id: taskId });

    const result = await callClaude(SYSTEM, USER(today, weekday), { maxTokens: 2000 });

    const path = `fitness/workouts/${today}.md`;
    const frontmatter = `---\ndate: ${today}\nday: ${weekday}\nphase: Cycle 1\n---\n\n`;
    await writeFile(path, frontmatter + result.text, `[fitness-trainer] workout ${today}`);

    await upsertTask({
      id: taskId,
      title: `Workout: ${weekday}`,
      assigned_to: "ceo",
      proposed_by: "fitness-trainer",
      okr_id: "O1-KR2",
      priority: "P1",
      status: "todo",
      estimated_minutes: 50,
      output_path: path,
    });

    await addTokenUsage(
      "fitness-trainer",
      "health",
      result.model,
      result.input_tokens,
      result.output_tokens
    );
    await setAgentStatus("fitness-trainer", "idle", null);
    await appendActivity("fitness-trainer", "workout_generated", {
      task_id: taskId,
      tokens_in: result.input_tokens,
      tokens_out: result.output_tokens,
      output: path,
    });
    await touchState();

    await sendPushIfSubscribed(getBaseUrl(), {
      title: "🏋️ Workout วันนี้พร้อมแล้ว",
      body: `วัน${weekday} · เปิดดูแผน`,
      url: "/fitness",
      tag: "workout-daily",
    });

    return NextResponse.json({ ok: true, output: path });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    await appendActivity("fitness-trainer", "task_blocked", {
      task_id: taskId,
      note: msg,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
