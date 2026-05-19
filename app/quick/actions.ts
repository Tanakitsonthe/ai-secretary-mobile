"use server";

import { readFile, writeFile, todayBkkDate } from "@/lib/github";
import type { Task, TasksFile, Priority } from "@/lib/company";
import { revalidatePath } from "next/cache";

function nowIso(): string {
  const now = new Date();
  const offset = 7 * 60;
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 19) + "+07:00";
}

function nextTaskId(existing: Task[]): string {
  const nums = existing
    .map((t) => parseInt(t.id.replace("T-", ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length === 0 ? 0 : Math.max(...nums);
  return `T-${String(max + 1).padStart(3, "0")}`;
}

export async function addTask(
  title: string,
  options: { priority?: Priority; assignedTo?: string } = {}
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const trimmed = title.trim();
  if (!trimmed) return { ok: false, error: "empty title" };

  const today = todayBkkDate();
  const path = `company/tasks/${today}.json`;

  let file: TasksFile;
  try {
    const raw = await readFile(path);
    file = JSON.parse(raw) as TasksFile;
  } catch {
    file = { date: today, tasks: [] };
  }

  const id = nextTaskId(file.tasks);
  const task: Task = {
    id,
    title: trimmed,
    assigned_to: options.assignedTo ?? "ceo",
    proposed_by: "ceo",
    okr_id: null,
    priority: options.priority ?? "P2",
    status: "todo",
    created_at: nowIso(),
    dependencies: [],
  };
  file.tasks.push(task);

  try {
    await writeFile(
      path,
      JSON.stringify(file, null, 2) + "\n",
      `[ceo] add task ${id} — ${trimmed.slice(0, 60)}`
    );
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "unknown",
    };
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true, id };
}
