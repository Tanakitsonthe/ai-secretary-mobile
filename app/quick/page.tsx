import QuickAddForm from "./QuickAddForm";

export const dynamic = "force-static";

export default function QuickAddPage() {
  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">⚡ Quick Add</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          พูดหรือพิมพ์ — สร้าง task ในวินาที
        </p>
      </header>
      <div className="px-4 py-4">
        <QuickAddForm />
      </div>
    </div>
  );
}
