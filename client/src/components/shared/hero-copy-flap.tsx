import { motion } from "framer-motion";
import { ArrowRight, Check, CircleDot, FileCheck2, Scale, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const signals = [
  { label: "Evidence aligned", detail: "12 source records", icon: FileCheck2, tone: "#55755d" },
  { label: "Policy in context", detail: "3 relevant controls", icon: Scale, tone: "#6b7f95" },
  { label: "Decision ready", detail: "Human review next", icon: Sparkles, tone: "#9a7647" },
];

export function HeroCopyFlap() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % signals.length), 2300);
    return () => window.clearInterval(timer);
  }, []);
  const signal = signals[active];
  const SignalIcon = signal.icon;

  return (
    <div className="mt-7 max-w-xl">
      <p className="text-[1.02rem] leading-8 text-muted-foreground sm:text-[1.08rem]">
        VindicAI turns scattered <span className="relative inline-block font-medium text-[#263d32]">evidence<span className="absolute -bottom-0.5 left-0 h-px w-full bg-[#9db89e]" /></span>, policies, and conversations into a <span className="font-medium text-[#263d32]">defensible operating record</span>—so you can see what matters, decide with confidence, and move forward.
      </p>
      <motion.div layout className="relative mt-5 overflow-hidden rounded-2xl border border-[#dedbd0] bg-white/65 p-3 shadow-[0_12px_34px_rgba(57,68,57,.07)] backdrop-blur-sm">
        <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: signal.tone }} />
        <div className="flex items-center gap-3 pl-1"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${signal.tone}18`, color: signal.tone }}><SignalIcon className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-[10px] font-bold uppercase tracking-[.16em]" style={{ color: signal.tone }}>{signal.label}</p><span className="flex items-center gap-1 text-[10px] text-[#899187]"><CircleDot className="size-2.5 animate-pulse" /> live signal</span></div><p className="mt-0.5 text-xs text-[#687269]">{signal.detail} <span className="mx-1 text-[#c5c0b5]">·</span> confidence stays visible</p></div><ArrowRight className="size-4 text-[#a8aaa2]" /></div>
        <div className="mt-3 flex gap-1 pl-1">{signals.map((item, index) => <button type="button" key={item.label} onClick={() => setActive(index)} aria-label={`Show ${item.label}`} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8e5dc]"><motion.span animate={{ width: index === active ? "100%" : index < active ? "100%" : "18%" }} transition={{ duration: .35 }} className="block h-full rounded-full" style={{ backgroundColor: index === active ? item.tone : "#c9cec6" }} /></button>)}</div>
      </motion.div>
      <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#7b867c]"><Check className="size-3.5 text-[#6a9274]" /> No black box. Every next move keeps its source.</div>
    </div>
  );
}

export default HeroCopyFlap;
