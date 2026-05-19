import { NextResponse } from "next/server";
import { writeFile } from "@/lib/github";
import { callClaude } from "@/lib/claude";
import {
  todayBkk,
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

const SYSTEM = `You are NUT's project-builder. Design a weekly mini-project for a Thai CS student.
Combines 2+ interests: web dev / robotics / investing / AI.
Fits 2-4 hour build. Must push forward an OKR.
Write in Thai with code examples in English.`;

const USER = (today: string) => `วันที่ ${today}

เสนอ mini-project สำหรับสัปดาห์นี้.
รูปแบบ markdown:
- ชื่อโปรเจกต์
- ทำไม (link กับ OKR ไหน)
- Stack
- Step-by-step plan (4-6 ขั้น)
- Definition of done
- Stretch goals (optional)

OKRs ที่ active:
- O2: เตรียมฝึกงาน Web Dev (Next.js, React)
- O4: AI Secretary evolution`;

function isoWeek(d: Date): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayBkk();
  const taskId = "T-weekly";
  const week = isoWeek(new Date());

  try {
    await setAgentStatus("project-builder", "working", taskId);
    await appendActivity("project-builder", "task_start", { task_id: taskId });

    const result = await callClaude(SYSTEM, USER(today), { maxTokens: 2500 });

    const slug = (result.text.match(/^#\s+(.+)$/m)?.[1] ?? "mini")
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]+/gi, "-")
      .slice(0, 30);
    const path = `projects/weekly/${week}-${slug}.md`;
    await writeFile(path, result.text, `[project-builder] weekly mini ${week}`);

    await upsertTask({
      id: taskId,
      title: `Weekly mini: ${slug}`,
      assigned_to: "ceo",
      proposed_by: "project-builder",
      okr_id: "O4",
      priority: "P2",
      status: "todo",
      estimated_minutes: 180,
      output_path: path,
    });

    await addTokenUsage(
      "project-builder",
      "engineering",
      result.model,
      result.input_tokens,
      result.output_tokens
    );
    await setAgentStatus("project-builder", "idle", null);
    await appendActivity("project-builder", "weekly_proposed", {
      task_id: taskId,
      tokens_in: result.input_tokens,
      tokens_out: result.output_tokens,
      output: path,
    });
    await touchState();

    await sendPushIfSubscribed(getBaseUrl(), {
      title: "💡 Mini project ใหม่ของสัปดาห์",
      body: `${slug} · เปิดดูแผน`,
      url: "/projects",
      tag: "weekly-project",
    });

    return NextResponse.json({ ok: true, output: path });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    await appendActivity("project-builder", "task_blocked", {
      task_id: taskId,
      note: msg,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
