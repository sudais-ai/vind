import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bot, Check, ChevronDown, Clock3, FileText, Filter, LockKeyhole, MoreHorizontal, Plus, RefreshCw, Search, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/layout/app-shell";
import { CaseStatusBadge } from "@/components/case/case-status-badge";
import { RiskIndicator } from "@/components/case/risk-indicator";
import { AIProcessingStatus } from "@/components/intelligence/ai-processing-status";
import { ConfidenceIndicator } from "@/components/intelligence/confidence-indicator";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { mockCaseService } from "@/services/case-service";
import type { AIProcessingState, CaseSummary } from "@/types/vindicai";

const reveal = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [query, setQuery] = useState("");
  const [viewState, setViewState] = useState<"loading" | "ready" | "error">("loading");
  const [aiState, setAiState] = useState<AIProcessingState>("analyzing");

  useEffect(() => {
    let mounted = true;
    mockCaseService.listCases().then((result) => {
      if (!mounted) return;
      setCases(result.data);
      setViewState("ready");
    }).catch(() => {
      if (mounted) setViewState("error");
    });
    return () => { mounted = false; };
  }, []);

  const visibleCases = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return cases;
    return cases.filter((item) => `${item.title} ${item.counterparty} ${item.status}`.toLowerCase().includes(normalized));
  }, [cases, query]);

  const toggleAI = () => setAiState((current) => current === "analyzing" ? "ready" : "analyzing");

  return (
    <AppShell>
      <div className="container pb-16 pt-8 sm:pt-10">
        <motion.div initial="hidden" animate="show" variants={reveal} className="flex flex-col gap-8">
          <section className="relative overflow-hidden rounded-lg border border-border bg-card px-5 py-7 surface-grid sm:px-8 sm:py-9 lg:px-10">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#65816c]"><Sparkles className="size-3.5" aria-hidden="true" /> Case intelligence foundation</div>
              <h1 className="mt-4 max-w-xl font-display text-[2.6rem] leading-[1.03] tracking-[-0.035em] text-foreground sm:text-5xl">Make the record <span className="text-[#76927b]">unmistakable.</span></h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">VindicAI brings your dispute evidence, rules, and decisions into one calm operating surface—so every next step is grounded, reviewable, and yours to approve.</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button className="gap-2 bg-primary px-4 shadow-sm hover:bg-primary/90"><Plus className="size-4" aria-hidden="true" /> Start a case</Button>
                <Button variant="outline" className="gap-2 border-[#c8c2b7] bg-card/70 px-4"><FileText className="size-4" aria-hidden="true" /> View evidence ledger</Button>
              </div>
            </div>
            <div className="pointer-events-none absolute -right-14 -top-20 hidden size-[290px] rounded-full border border-[#dbe3d8] sm:block" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-1 -top-7 hidden size-[220px] rounded-full border border-[#e6ddd0] sm:block" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-4 right-10 hidden w-36 text-right text-[10px] uppercase tracking-[0.16em] text-[#94a294] sm:block">AI recommends<br />human decides</div>
          </section>

          <section aria-labelledby="workspace-pulse-heading">
            <div className="mb-3 flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Workspace pulse</p><h2 id="workspace-pulse-heading" className="mt-1 text-lg font-semibold tracking-[-0.02em]">Your disputes, at a glance</h2></div><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><RefreshCw className="size-3.5" aria-hidden="true" /> Refresh</Button></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Open cases", value: "08", detail: "+2 this week", icon: FileText, color: "text-[#637f6c]" },
                { label: "Awaiting approval", value: "03", detail: "Needs your review", icon: Clock3, color: "text-[#ad8550]" },
                { label: "Evidence indexed", value: "126", detail: "Across all cases", icon: Check, color: "text-[#5c7890]" },
              ].map((item, index) => (
                <motion.div key={item.label} variants={reveal} transition={{ delay: index * 0.06 }} className="surface-lift rounded-md border border-border bg-card p-4 transition-transform">
                  <div className="flex items-start justify-between"><span className="text-xs font-medium text-muted-foreground">{item.label}</span><item.icon className={`size-4 ${item.color}`} strokeWidth={1.8} aria-hidden="true" /></div>
                  <div className="mt-4 flex items-end justify-between"><span className="font-display text-3xl text-foreground">{item.value}</span><span className="text-[11px] text-muted-foreground">{item.detail}</span></div>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
            <section className="min-w-0 rounded-md border border-border bg-card" aria-labelledby="cases-heading">
              <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 id="cases-heading" className="text-base font-semibold">Active case file</h2><p className="mt-1 text-xs text-muted-foreground">The working record stays structured, traceable, and ready for review.</p></div>
                <Button variant="outline" size="sm" className="w-fit gap-2 border-[#c8c2b7]"><Filter className="size-3.5" aria-hidden="true" /> Filter <ChevronDown className="size-3" aria-hidden="true" /></Button>
              </div>
              <div className="flex items-center gap-2 border-b border-border px-5 py-3"><Search className="size-4 text-muted-foreground" aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases or counterparties" aria-label="Search cases or counterparties" className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" /></div>
              <div className="overflow-x-auto">
                {viewState === "loading" && <LoadingState label="Loading your case file" />}
                {viewState === "error" && <ErrorState onRetry={() => { setViewState("loading"); mockCaseService.listCases().then((result) => { setCases(result.data); setViewState("ready"); }).catch(() => setViewState("error")); }} />}
                {viewState === "ready" && (
                  <table className="w-full min-w-[720px] text-left text-sm"><caption className="sr-only">Active dispute cases</caption><thead className="border-b border-border bg-[#f8f6f1] text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Case</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Risk</th><th className="px-4 py-3 font-semibold">Confidence</th><th className="px-4 py-3 font-semibold">Updated</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-border/80">{visibleCases.map((item) => <tr key={item.id} className="group transition-colors hover:bg-[#faf9f5]"><td className="px-5 py-4"><div className="flex items-start gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[#eef2ec] text-[#587762]"><FileText className="size-4" aria-hidden="true" /></span><div><div className="font-semibold text-foreground">{item.title}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><span>{item.counterparty}</span><span className="text-border">·</span><span>{item.evidenceCount} sources</span></div></div></div></td><td className="px-4 py-4"><CaseStatusBadge status={item.status} /></td><td className="px-4 py-4"><RiskIndicator level={item.risk} /></td><td className="px-4 py-4"><ConfidenceIndicator value={item.confidence} /></td><td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">{item.updatedAt}</td><td className="px-4 py-4"><Button variant="ghost" size="icon-sm" aria-label={`More actions for ${item.title}`}><MoreHorizontal className="size-4" /></Button></td></tr>)}</tbody></table>
                )}
                {viewState === "ready" && visibleCases.length === 0 && <div className="px-5 py-10 text-center text-sm text-muted-foreground">No cases match that search.</div>}
              </div>
              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground"><span>Showing {visibleCases.length} of {cases.length} case files</span><Button variant="link" size="sm" className="h-auto gap-1 p-0 text-primary">Open case index <ArrowUpRight className="size-3" /></Button></div>
            </section>

            <aside className="space-y-5" aria-label="Workspace intelligence">
              <section className="rounded-md border border-[#cfdcca] bg-[#f1f6ef] p-4" aria-labelledby="intelligence-heading"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-md bg-[#dbe9d9] text-[#55755d]"><Bot className="size-4" aria-hidden="true" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#55755d]">Intelligence pulse</p><h2 id="intelligence-heading" className="mt-0.5 text-sm font-semibold text-foreground">Evidence desk</h2></div></div><span className="text-[10px] font-semibold text-[#55755d]">MOCK MODE</span></div><div className="mt-4"><AIProcessingStatus state={aiState} /></div><div className="mt-3 flex items-center justify-between"><p className="max-w-[210px] text-[11px] leading-relaxed text-[#617064]">No action is executed by AI. Review the reasoning before approving a next step.</p><Button variant="outline" size="sm" className="shrink-0 border-[#b9cdb8] bg-[#f7faf5] text-[#365943]" onClick={toggleAI}>{aiState === "analyzing" ? "Mark ready" : "Run again"}</Button></div></section>
              <section className="rounded-md border border-border bg-card p-4" aria-labelledby="approval-heading"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Human control</p><h2 id="approval-heading" className="mt-1 text-sm font-semibold">Approval queue</h2></div><span className="flex size-6 items-center justify-center rounded-full bg-[#f7ead9] text-[11px] font-bold text-[#976d38]">3</span></div><div className="mt-4 space-y-3"><div className="flex gap-3"><LockKeyhole className="mt-0.5 size-4 text-[#a17a43]" aria-hidden="true" /><div><p className="text-xs font-semibold">Response draft ready</p><p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">Northwind Utilities · high-impact action</p></div></div><div className="flex gap-3"><Users className="mt-0.5 size-4 text-[#6b8594]" aria-hidden="true" /><div><p className="text-xs font-semibold">Source conflict detected</p><p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">Asteria Cloud · needs your context</p></div></div></div><Button variant="outline" size="sm" className="mt-5 w-full justify-between border-[#c8c2b7]">Review queue <ArrowUpRight className="size-3.5" /></Button></section>
              <section className="rounded-md border border-border bg-[#f5f1e8] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8f7349]">Design system specimen</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">A calm interface for high-stakes work: clear states, visible provenance, and no black-box decisions.</p><div className="mt-4 flex flex-wrap gap-2"><CaseStatusBadge status="verified" /><CaseStatusBadge status="pending-approval" /></div></section>
            </aside>
          </div>

          <AnimatePresence mode="wait"><motion.section key="showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28, duration: 0.4 }} className="border-t border-border pt-6" aria-labelledby="foundation-heading"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Step 01 · Step 02</p><h2 id="foundation-heading" className="mt-1 text-lg font-semibold">Foundation and design system</h2></div><p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-right">Reusable primitives are in place for inputs, controls, navigation, feedback, overlays, tables, and human-controlled intelligence states.</p></div></motion.section></AnimatePresence>
        </motion.div>
      </div>
    </AppShell>
  );
}
