import { NextResponse } from "next/server";
import { readFile } from "@/lib/github";
import {
  todayBkk,
  appendActivity,
  sendPushIfSubscribed,
  getBaseUrl,
  isAuthorizedCron,
} from "@/lib/heartbeat";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = todayBkk();

  // Skip if reflection already exists for today
  try {
    await readFile(`reflections/${today}.md`);
    return NextResponse.json({ ok: true, skipped: "already_reflected" });
  } catch {}

  await sendPushIfSubscribed(getBaseUrl(), {
    title: "📝 ทบทวนวันนี้ก่อนนอน",
    body: "energy + mood + พรุ่งนี้โฟกัสอะไร (3 นาที)",
    url: "/reflect",
    tag: "reflect-reminder",
    requireInteraction: false,
  } as Parameters<typeof sendPushIfSubscribed>[1]);

  await appendActivity("system", "push_sent", {
    note: "reflect-reminder 22:00 BKK",
  });

  return NextResponse.json({ ok: true });
}
