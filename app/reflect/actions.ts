"use server";

import { writeFile, todayBkkDate } from "@/lib/github";
import { revalidatePath } from "next/cache";

export type Reflection = {
  date: string;
  energy: number;
  went_well: string;
  went_wrong: string;
  tomorrow_focus: string;
  mood: string;
  saved_at: string;
};

function nowIso(): string {
  const now = new Date();
  const offset = 7 * 60;
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 19) + "+07:00";
}

export async function saveReflection(
  data: Omit<Reflection, "date" | "saved_at">
): Promise<{ ok: true } | { ok: false; error: string }> {
  const date = todayBkkDate();
  const full: Reflection = { ...data, date, saved_at: nowIso() };

  const md = `---
date: ${date}
energy: ${data.energy}
mood: ${data.mood}
saved_at: ${full.saved_at}
---

# 📝 Reflection — ${date}

## 💪 Energy: ${data.energy}/10 · ${data.mood}

## ✅ ดี / สำเร็จ
${data.went_well || "_(ไม่ได้เขียน)_"}

## ⚠️ ติด / ผิดพลาด
${data.went_wrong || "_(ไม่ได้เขียน)_"}

## 🎯 พรุ่งนี้โฟกัส
${data.tomorrow_focus || "_(ไม่ได้เขียน)_"}
`;

  try {
    await writeFile(
      `reflections/${date}.md`,
      md,
      `[ceo] reflection ${date} — energy ${data.energy}/10`
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }

  revalidatePath("/reflect");
  revalidatePath("/");
  return { ok: true };
}
