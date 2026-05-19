"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/lib/company";
import { setTaskStatus, deleteTask, updateTaskTitle } from "./actions";
import { PRIORITY_TH, PRIORITY_DOT } from "@/lib/labels";

type Props = {
  task: Task;
  date: string;
  agentEmoji?: string;
  agentName?: string;
  agentSlug?: string;
};

export default function TaskRow({ task, date, agentEmoji, agentName }: Props) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [confirming, setConfirming] = useState(false);

  const done = task.status === "done";

  function toggleDone() {
    start(async () => {
      await setTaskStatus(date, task.id, done ? "todo" : "done");
    });
  }
  function start_() {
    start(async () => {
      await setTaskStatus(date, task.id, "doing");
    });
  }
  function save() {
    start(async () => {
      await updateTaskTitle(date, task.id, draft);
      setEditing(false);
    });
  }
  function remove() {
    start(async () => {
      await deleteTask(date, task.id);
    });
  }

  return (
    <li className="px-4 py-3 flex items-start gap-3">
      <button
        onClick={toggleDone}
        disabled={pending}
        aria-label={done ? "ยกเลิกเสร็จ" : "ทำเสร็จ"}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center active:scale-90 transition-transform ${
          done
            ? "bg-green-500 border-green-500 text-white"
            : "border-zinc-300 dark:border-zinc-700 hover:border-blue-500"
        }`}
      >
        {done && <span className="text-[10px] leading-none">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2 items-start">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              className="flex-1 text-sm border rounded p-2 bg-transparent border-zinc-300 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={save}
                disabled={pending}
                className="text-[11px] px-2 py-1 rounded bg-blue-600 text-white font-semibold"
              >
                บันทึก
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setDraft(task.title);
                }}
                className="text-[11px] px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`text-sm leading-snug ${
                done ? "line-through text-zinc-500" : "font-medium"
              }`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-zinc-500 dark:text-zinc-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`}
              />
              <span>{PRIORITY_TH[task.priority]}</span>
              {agentEmoji && (
                <span className="flex items-center gap-1">
                  · <span>{agentEmoji}</span>
                  <span>{agentName}</span>
                </span>
              )}
              {task.estimated_minutes && <span>· {task.estimated_minutes} น.</span>}
              {task.deadline && <span>· เดดไลน์ {task.deadline.slice(11, 16)}</span>}
            </div>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex flex-col gap-1 items-end shrink-0">
          {task.status === "todo" && !done && (
            <button
              onClick={start_}
              disabled={pending}
              className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              ▶️ เริ่ม
            </button>
          )}
          <details className="text-right">
            <summary className="cursor-pointer text-zinc-400 text-base leading-none px-1 list-none">
              ⋮
            </summary>
            <div className="mt-1 flex flex-col gap-1 items-end">
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 font-medium"
              >
                ✏️ แก้
              </button>
              {confirming ? (
                <button
                  onClick={remove}
                  disabled={pending}
                  className="text-[10px] px-2 py-1 rounded bg-red-600 text-white font-semibold"
                >
                  ยืนยันลบ
                </button>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  className="text-[10px] px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-red-600"
                >
                  🗑 ลบ
                </button>
              )}
            </div>
          </details>
        </div>
      )}
    </li>
  );
}
