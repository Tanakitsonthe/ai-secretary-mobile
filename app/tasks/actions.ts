"use server";

import { readFile, writeFile } from "@/lib/github";
import type { TaskStatus, TasksFile } from "@/lib/company";
import { revalidatePath } from "next/cache";

function nowIso(): string {
  const now = new Date();
  const offset = 7 * 60;
  const local = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
  return local.toISOString().slice(0, 19) + "+07:00";
}

export async function setTaskStatus(
  date: string,
  taskId: string,
  status: TaskStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  const path = `company/tasks/${date}.json`;
  try {
    const raw = await readFile(path);
    const file = JSON.parse(raw) as TasksFile;
    const idx = file.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0) return { ok: false, error: "task not found" };

    const t = file.tasks[idx];
    t.status = status;
    if (status === "doing" && !t.started_at) t.started_at = nowIso();
    if (status === "done") t.completed_at = nowIso();

    await writeFile(
      path,
      JSON.stringify(file, null, 2) + "\n",
      `[ceo] ${status} task ${taskId}`
    );
    revalidatePath("/tasks");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export async function deleteTask(
  date: string,
  taskId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const path = `company/tasks/${date}.json`;
  try {
    const raw = await readFile(path);
    const file = JSON.parse(raw) as TasksFile;
    const before = file.tasks.length;
    file.tasks = file.tasks.filter((t) => t.id !== taskId);
    if (file.tasks.length === before) return { ok: false, error: "not found" };

    await writeFile(
      path,
      JSON.stringify(file, null, 2) + "\n",
      `[ceo] delete task ${taskId}`
    );
    revalidatePath("/tasks");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export async function updateTaskTitle(
  date: string,
  taskId: string,
  title: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = title.trim();
  if (!trimmed) return { ok: false, error: "empty title" };

  const path = `company/tasks/${date}.json`;
  try {
    const raw = await readFile(path);
    const file = JSON.parse(raw) as TasksFile;
    const idx = file.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0) return { ok: false, error: "task not found" };
    file.tasks[idx].title = trimmed;

    await writeFile(
      path,
      JSON.stringify(file, null, 2) + "\n",
      `[ceo] edit task ${taskId}`
    );
    revalidatePath("/tasks");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
