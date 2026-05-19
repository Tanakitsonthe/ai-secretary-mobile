import { NextRequest, NextResponse } from "next/server";
import { writeFile, deleteFile } from "@/lib/github";

export const runtime = "nodejs";

const SUBSCRIPTION_PATH = "company/notifications/subscription.json";

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json();
    if (!sub || !sub.endpoint) {
      return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
    }
    await writeFile(
      SUBSCRIPTION_PATH,
      JSON.stringify({ ...sub, saved_at: new Date().toISOString() }, null, 2) + "\n",
      "[ceo] subscribe to push notifications"
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await deleteFile(SUBSCRIPTION_PATH, "[ceo] unsubscribe from push");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
