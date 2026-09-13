import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function FlipText({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  return <AnimatePresence mode="wait"><motion.span key={text} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.36, ease: [0.23, 1, 0.32, 1] }} className={`inline-block ${className ?? ""}`}>{text}</motion.span></AnimatePresence>;
}
