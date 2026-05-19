import { getPendingProposals, getDecisions, getAllAgents } from "@/lib/company";
import { listDir } from "@/lib/github";
import { decideProposal } from "./actions";
import Link from "next/link";

export const revalidate = 60;

async function getPendingWithFilenames() {
  const files = await listDir("company/proposals");
  const proposals = await getPendingProposals();
  const map = new Map(proposals.map((p) => [p.id, p]));

  const withFn = files
    .filter((f) => f.type === "file" && f.name.endsWith(".json") && !f.name.startsWith("."))
    .map((f) => {
      const matched = Array.from(map.values()).find((p) =>
        f.name.includes(p.id)
      );
      return matched ? { proposal: matched, filename: f.name } : null;
    })
    .filter(Boolean) as { proposal: ReturnType<typeof getPendingProposals> extends Promise<(infer T)[]> ? T : never; filename: string }[];

  return withFn;
}

export default async function ProposalsPage() {
  const [pending, decisions, agents] = await Promise.all([
    getPendingWithFilenames(),
    getDecisions(),
    getAllAgents(),
  ]);

  const agentBySlug = new Map(agents.map((a) => [a.slug, a]));
  const recentDecisions = decisions.slice(0, 5);

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold">
          ✋ Proposals
          {pending.length > 0 && (
            <span className="ml-2 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
              {pending.length} รออนุมัติ
            </span>
          )}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          คำขอจากพนักงาน · CEO ตัดสิน
        </p>
      </header>

      {pending.length === 0 && (
        <div className="m-4 p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-zinc-500">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm font-medium">ไม่มีคำขอค้าง</p>
          <p className="text-[11px] mt-1">CEO ว่างได้</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-3">
        {pending.map(({ proposal: p, filename }) => {
          const proposer = agentBySlug.get(p.proposed_by);
          return (
            <article key={p.id} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                {proposer && (
                  <>
                    <span className="text-lg">{proposer.emoji}</span>
                    <span className="text-sm font-medium">{proposer.name}</span>
                  </>
                )}
                <span className="text-[10px] font-mono text-zinc-400 ml-auto">
                  {p.id}
                </span>
              </div>

              <h2 className="text-base font-bold leading-tight mb-1">
                {p.title}
              </h2>

              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 leading-relaxed">
                {p.rationale}
              </p>

              <div className="flex items-center gap-2 mb-3 flex-wrap text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  📂 {p.category}
                </span>
                {p.estimated_cost_usd != null && p.estimated_cost_usd > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    💸 ${p.estimated_cost_usd.toFixed(2)}
                  </span>
                )}
                {p.affects.map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px]"
                  >
                    {a}
                  </span>
                ))}
              </div>

              {p.preview && (
                <details className="mb-3">
                  <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer">
                    ดู preview
                  </summary>
                  <pre className="mt-2 text-[11px] p-2 rounded bg-zinc-100 dark:bg-zinc-900 overflow-x-auto whitespace-pre-wrap">
                    {p.preview}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await decideProposal(filename, "approved");
                  }}
                  className="flex-1"
                >
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm active:scale-[0.98] transition-transform"
                  >
                    ✓ อนุมัติ
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await decideProposal(filename, "rejected");
                  }}
                  className="flex-1"
                >
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 font-semibold text-sm active:scale-[0.98] transition-transform"
                  >
                    ✗ ปฏิเสธ
                  </button>
                </form>
              </div>

              <p className="text-[10px] text-zinc-400 mt-2 text-center">
                เสนอเมื่อ {p.requested_at.slice(0, 16).replace("T", " ")}
              </p>
            </article>
          );
        })}
      </div>

      {/* Recent decisions */}
      {recentDecisions.length > 0 && (
        <section className="px-4 pt-2 pb-8">
          <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase mb-2 px-1">
            ตัดสินไปแล้ว
          </h2>
          <ul className="card divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
            {recentDecisions.map((d) => (
              <li
                key={d.id}
                className="px-4 py-2.5 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <p className="text-[10px] text-zinc-500">
                    {d.decided_at?.slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    d.status === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {d.status === "approved" ? "✓ อนุมัติ" : "✗ ปฏิเสธ"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="px-4 pb-8">
        <Link
          href="/proposals/schema"
          className="text-[11px] text-zinc-400 hover:underline block text-center"
        >
          ดู schema ของ proposals
        </Link>
      </div>
    </div>
  );
}
