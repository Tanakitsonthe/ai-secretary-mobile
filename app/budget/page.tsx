import { getBudget } from "@/lib/company";

export const revalidate = 300;

export default async function BudgetPage() {
  const budget = await getBudget();

  if (!budget) {
    return (
      <div className="p-4">
        <p className="text-sm text-zinc-500">ยังไม่มีข้อมูล budget</p>
      </div>
    );
  }

  const todayPct = Math.min(
    100,
    (budget.totals.today.cost_usd / budget.caps.daily_usd) * 100
  );
  const monthPct = Math.min(
    100,
    (budget.totals.this_month.cost_usd / budget.caps.monthly_usd) * 100
  );

  const agentEntries = Object.entries(budget.per_agent_today).sort(
    (a, b) => b[1].cost_usd - a[1].cost_usd
  );

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">💸 Budget</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          ค่าใช้จ่าย token ของบริษัท
        </p>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Today */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">วันนี้</h2>
            <span className="text-2xl font-bold tabular">
              ${budget.totals.today.cost_usd.toFixed(2)}
            </span>
          </div>
          <ProgressBar percent={todayPct} />
          <p className="text-[11px] text-zinc-500 mt-1.5">
            cap ${budget.caps.daily_usd.toFixed(2)}/day · used{" "}
            {todayPct.toFixed(1)}%
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Stat
              label="Input tokens"
              value={budget.totals.today.input_tokens.toLocaleString()}
            />
            <Stat
              label="Output tokens"
              value={budget.totals.today.output_tokens.toLocaleString()}
            />
          </div>
        </section>

        {/* Month */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">
              เดือนนี้ ({budget.totals.this_month.month})
            </h2>
            <span className="text-2xl font-bold tabular">
              ${budget.totals.this_month.cost_usd.toFixed(2)}
            </span>
          </div>
          <ProgressBar percent={monthPct} />
          <p className="text-[11px] text-zinc-500 mt-1.5">
            cap ${budget.caps.monthly_usd.toFixed(2)}/month · used{" "}
            {monthPct.toFixed(1)}%
          </p>
        </section>

        {/* Lifetime */}
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">รวมทั้งหมด</h2>
            <span className="text-xl font-bold tabular text-zinc-700 dark:text-zinc-300">
              ${budget.totals.lifetime.cost_usd.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Per-agent */}
        {agentEntries.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
              ต่อพนักงาน (วันนี้)
            </h2>
            <ul className="space-y-2">
              {agentEntries.map(([slug, totals]) => (
                <li
                  key={slug}
                  className="card p-3 flex items-center justify-between"
                >
                  <span className="font-medium text-sm">{slug}</span>
                  <span className="font-bold text-sm tabular">
                    ${totals.cost_usd.toFixed(3)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Rates reference */}
        <section className="card p-4">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2">
            อัตรา ($/M tokens)
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500">
                <th className="text-left font-medium pb-1">Model</th>
                <th className="text-right font-medium pb-1">Input</th>
                <th className="text-right font-medium pb-1">Output</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(budget.rates_per_mtok).map(([model, rates]) => (
                <tr key={model} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-1.5 font-mono text-[11px]">{model}</td>
                  <td className="text-right tabular">${rates.input}</td>
                  <td className="text-right tabular">${rates.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const color =
    percent < 50
      ? "bg-green-500"
      : percent < 80
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="font-bold tabular text-sm">{value}</p>
    </div>
  );
}
