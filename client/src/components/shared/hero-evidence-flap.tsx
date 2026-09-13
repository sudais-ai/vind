import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, FileText, GitBranch, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const stages = [
  { label: "Evidence", kicker: "12 sources indexed", color: "#55755d", icon: FileText },
  { label: "Intelligence", kicker: "3 signals surfaced", color: "#6b7f95", icon: GitBranch },
  { label: "Decision", kicker: "Human approval ready", color: "#9a7647", icon: ShieldCheck },
];
const words = ["evidence", "policies", "conversations", "decisions"];
const staggerItem = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as const } } };

export function HeroEvidenceFlap() {
  const [active, setActive] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % stages.length), 2600);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setWordIndex((current) => (current + 1) % words.length), 2500);
    return () => window.clearInterval(timer);
  }, []);
  const stage = stages[active];
  const Icon = stage.icon;

  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto" aria-label="Animated evidence to decision preview">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_70%_20%,rgba(166,190,166,.32),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(207,188,151,.18),transparent_45%)] blur-2xl" />
      <motion.div initial={reducedMotion ? false : "hidden"} whileInView={reducedMotion ? undefined : "visible"} viewport={{ once: true, amount: 0.25 }} variants={{ hidden: { opacity: 0, y: 22, rotate: 1 }, visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: .7, ease: [0.23, 1, 0.32, 1] as const, staggerChildren: 0.09 } } }} className="relative overflow-hidden rounded-[1.6rem] border border-[#d7d5ca] bg-[#fbfaf6]/95 p-4 shadow-[0_26px_70px_rgba(57,68,57,.13)] backdrop-blur-xl sm:p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#55755d] via-[#9a7647] to-[#6b7f95]" />
        <motion.div variants={staggerItem} className="flex items-center justify-between gap-3 border-b border-[#e5e1d8] pb-4">
          <div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-[#18324b] text-[#f7f4ee]"><Sparkles className="size-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#7d857b]">VindicAI signal map</p><p className="mt-0.5 text-sm font-semibold text-[#26332c]">Northwind · duplicate charge</p></div></div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#e8f0e7] px-2.5 py-1 text-[10px] font-bold text-[#55755d]"><span className="size-1.5 animate-pulse rounded-full bg-[#55755d]" />Live preview</span>
        </motion.div>
        <motion.div variants={staggerItem} className="relative mt-5 grid grid-cols-3 gap-2">
          <div className="absolute left-[16%] right-[16%] top-6 h-px bg-gradient-to-r from-[#b8cdb8] via-[#c8c2b7] to-[#d9b982]" />
          {stages.map((item, index) => { const ItemIcon = item.icon; return <button key={item.label} type="button" onClick={() => setActive(index)} className={`relative z-10 flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_22px_rgba(50,60,50,.08)] ${active === index ? "bg-white shadow-[0_8px_22px_rgba(50,60,50,.08)]" : "opacity-60 hover:opacity-100"}`} aria-label={`Show ${item.label} stage`}><span className="flex size-9 items-center justify-center rounded-full border-4 border-[#fbfaf6] shadow-sm" style={{ backgroundColor: `${item.color}20`, color: item.color }}><ItemIcon className="size-4" /></span><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#5f685f]">{item.label}</span></button>; })}
        </motion.div>
        <motion.div variants={staggerItem} className="mt-5 border-b border-[#e5e1d8] pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#7d857b]">Turning scattered</p>
          <div className="mt-1 min-h-10 text-2xl font-semibold text-[#26332c] sm:text-3xl">
            <AnimatePresence mode="wait">
              <motion.span key={words[wordIndex]} initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reducedMotion ? 0 : 0.36, ease: [0.23, 1, 0.32, 1] as const }} className="inline-block text-[#55755d]">{words[wordIndex]}</motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div variants={staggerItem} key={stage.label} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: .24 }} className="mt-4 rounded-xl border border-[#e5e1d8] bg-white/75 p-4">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em]" style={{ color: stage.color }}>{stage.kicker}</p><h3 className="mt-1 text-base font-semibold text-[#26332c]">{stage.label === "Evidence" ? "The record stays traceable." : stage.label === "Intelligence" ? "Signals stay close to source." : "The next move stays yours."}</h3></div><Icon className="mt-1 size-5" style={{ color: stage.color }} /></div>
            <div className="mt-4 space-y-2.5">{stage.label === "Evidence" && ["September invoice · verified", "Billing terms v3.2 · cited", "Migration note · needs review"].map((item, index) => <div key={item} className="flex items-center gap-2.5 text-xs text-[#687269]"><span className={`flex size-5 items-center justify-center rounded-full ${index === 2 ? "bg-[#fbf0ed] text-[#a4584c]" : "bg-[#e8f0e7] text-[#55755d]"}`}>{index === 2 ? <ArrowUpRight className="size-3" /> : <Check className="size-3" />}</span>{item}</div>)}{stage.label === "Intelligence" && <div className="grid grid-cols-3 gap-2">{["Fact", "Claim", "Gap"].map((item, index) => <div key={item} className="rounded-lg bg-[#f4f1ea] p-2.5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7d857b]">{item}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e1ddd3]"><motion.div animate={{ width: `${[86, 64, 34][index]}%` }} className="h-full rounded-full" style={{ backgroundColor: ["#55755d", "#6b7f95", "#9a7647"][index] }} /></div><p className="mt-1.5 text-[10px] text-[#687269]">{["Supported", "Reviewable", "Open"][index]}</p></div>)}</div>}{stage.label === "Decision" && <div className="flex items-center justify-between rounded-lg bg-[#f7f1e6] px-3 py-2.5"><span className="text-xs text-[#6d6558]">Recommendation ready for review</span><span className="rounded-full bg-[#e4eee5] px-2 py-1 text-[10px] font-bold text-[#55755d]">Human gate</span></div>}</div>
          </motion.div>
        </AnimatePresence>
        <motion.div variants={staggerItem} className="mt-4 flex items-center justify-between border-t border-[#e5e1d8] pt-3 text-[10px] font-semibold uppercase tracking-[.13em] text-[#8b9188]"><span>AI recommends</span><span className="text-[#18324b]">People decide</span></motion.div>
      </motion.div>
    </div>
  );
}

export default HeroEvidenceFlap;

// Keep the original grid treatment available behind the panel on wide screens.
export function HeroEvidenceFlapBackdrop() { return <div aria-hidden="true" className="pointer-events-none absolute inset-0 surface-grid opacity-30" />; }
