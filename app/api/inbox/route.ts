import { NextResponse } from "next/server";
import { getPendingProposals, getAllMessages } from "@/lib/company";

export const revalidate = 30;

export async function GET() {
  try {
    const [proposals, messages] = await Promise.all([
      getPendingProposals(),
      getAllMessages(),
    ]);
    const unread = messages.filter((m) => !m.read && m.to === "ceo").length;
    return NextResponse.json({
      proposals: proposals.length,
      unread,
      total: proposals.length + unread,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
