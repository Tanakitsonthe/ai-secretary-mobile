import { NextResponse } from "next/server";
import { writeFile, readFile } from "@/lib/github";
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

const SYSTEM = `You are NUT's daily-briefer, a morning briefing AI for a Thai CS student.
Write in Thai. Use markdown with emojis. Keep it scannable.
Tone: friendly, motivating, specific. Avoid filler.`;

const USER_TEMPLATE = (today: string, weekday: string) => `วันที่ ${today} (${weekday}) — สร้าง morning brief ให้ NUT

CEO Profile:
- ชื่อ NUT (Tanakit), 21 ปี, CS+Robotics student
- กำลังเตรียมฝึกงาน Web Dev เริ่ม 2026-06-04
- น้ำหนัก 80→65 kg goal
- สนใจ stocks (US/Thai/crypto)
- ภาษาไทย casual

OKRs ปี 2026:
1. ลด 80→65 kg
2. พร้อมฝึกงาน Web Dev (HTML/CSS/JS/React)
3. เริ่มลงทุนจริงเป็น (stocks + crypto)
4. AI Secretary เป็นบริษัทจริง

เขียน brief ที่มี sections พวกนี้:
1. 📊 ภาพรวมตลาด (US/Asia/SET/Crypto) — ใส่ตัวเลขจริงล่าสุดที่คุณรู้ พร้อม disclaimer "ตรวจสอบราคา real-time อีกครั้ง"
2. 📰 ข่าวสำคัญ (3-5 ข้อ)
3. 💡 สิ่งที่มือใหม่ควรรู้ (1-2 concept)
4. 📅 ปฏิทินสำคัญวันนี้
5. 🎯 ภารกิจวันนี้ (3 งานที่ link กับ OKRs)
6. 💭 คำคิดวันนี้ (quote + tie-in)

ห้ามใช้ "In conclusion" "Furthermore". เป็นกันเองแบบเพื่อนสนิท.`;

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayBkk();
  const weekday = bkkWeekday();
  const taskId = "T-brief";

  try {
    await setAgentStatus("daily-briefer", "working", taskId);
    await appendActivity("daily-briefer", "task_start", { task_id: taskId });

    const result = await callClaude(SYSTEM, USER_TEMPLATE(today, weekday), {
      maxTokens: 4000,
    });

    const frontmatter = `---\ndate: ${today}\nday_of_week: ${weekday}\nmodel: ${result.model}\n---\n\n`;
    const path = `stocks/daily-news/${today}.md`;
    await writeFile(path, frontmatter + result.text, `[daily-briefer] morning brief ${today}`);

    await upsertTask({
      id: taskId,
      title: "Generate morning brief",
      assigned_to: "daily-briefer",
      proposed_by: "system",
      priority: "P1",
      status: "done",
      output_path: path,
      completed_at: new Date().toISOString(),
      tokens_estimated: result.input_tokens + result.output_tokens,
    });

    await addTokenUsage(
      "daily-briefer",
      "personal",
      result.model,
      result.input_tokens,
      result.output_tokens
    );
    await setAgentStatus("daily-briefer", "idle", null);
    await appendActivity("daily-briefer", "task_done", {
      task_id: taskId,
      tokens_in: result.input_tokens,
      tokens_out: result.output_tokens,
      output: path,
    });
    await touchState();

    await sendPushIfSubscribed(getBaseUrl(), {
      title: "🌅 Brief เช้านี้พร้อมแล้ว",
      body: "เปิดแอพอ่าน + สั่งงานทีม",
      url: "/",
      tag: "daily-brief",
    });

    return NextResponse.json({
      ok: true,
      tokens: result.input_tokens + result.output_tokens,
      output: path,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    await appendActivity("daily-briefer", "task_blocked", {
      task_id: taskId,
      note: msg,
    });
    await setAgentStatus("daily-briefer", "blocked", taskId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
