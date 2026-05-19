"use server";

import { readFile, writeFile, deleteFile } from "@/lib/github";
import type { Proposal } from "@/lib/company";
import { revalidatePath } from "next/cache";

function nowIso(): string {
  const now = new Date();
  const offset = 7 * 60;
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 19) + "+07:00";
}

export async function decideProposal(
  filename: string,
  decision: "approved" | "rejected",
  note?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!filename.endsWith(".json") || filename.includes("/") || filename.includes("..")) {
    return { ok: false, error: "Invalid filename" };
  }

  const src = `company/proposals/${filename}`;
  const dst = `company/decisions/${filename}`;

  let proposal: Proposal;
  try {
    const raw = await readFile(src);
    proposal = JSON.parse(raw) as Proposal;
  } catch (e) {
    return {
      ok: false,
      error: `Could not read proposal: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }

  const decided: Proposal = {
    ...proposal,
    status: decision,
    decided_at: nowIso(),
    decided_by: "ceo",
  };

  const commitMsg = `[ceo] ${decision} proposal ${proposal.id}${
    note ? ` — ${note}` : ""
  }`;

  try {
    await writeFile(dst, JSON.stringify(decided, null, 2) + "\n", commitMsg);
    await deleteFile(src, `[ceo] cleanup approved/rejected proposal ${proposal.id}`);
  } catch (e) {
    return {
      ok: false,
      error: `Failed to commit: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }

  revalidatePath("/proposals");
  revalidatePath("/");
  return { ok: true };
}
