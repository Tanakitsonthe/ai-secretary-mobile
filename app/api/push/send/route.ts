import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { readFile } from "@/lib/github";

export const runtime = "nodejs";

const SUBSCRIPTION_PATH = "company/notifications/subscription.json";

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:tanakit.sont@bumail.net";
  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys not configured (NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY)"
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function POST(req: NextRequest) {
  // Allow agent routines + the PWA itself to send. Require token if from external.
  const authHeader = req.headers.get("authorization");
  const internalSecret = process.env.PUSH_INTERNAL_SECRET;
  if (internalSecret) {
    const expected = `Bearer ${internalSecret}`;
    if (authHeader && authHeader !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    configureVapid();

    const body = await req.json();
    const payload = JSON.stringify({
      title: body.title || "AI Secretary",
      body: body.body || "",
      url: body.url || "/",
      tag: body.tag,
      icon: body.icon,
      requireInteraction: body.requireInteraction,
    });

    const raw = await readFile(SUBSCRIPTION_PATH);
    const sub = JSON.parse(raw);

    await webpush.sendNotification(sub, payload);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
