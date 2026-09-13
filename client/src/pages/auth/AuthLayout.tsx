import type { ReactNode } from "react";
import { Link } from "wouter";
import { AppLogo } from "@/components/shared/app-logo";

export function AuthLayout({ eyebrow, title, footer, children }: { eyebrow: string; title: string; footer?: ReactNode; children: ReactNode }) {
  return <div className="min-h-screen bg-background px-4 py-8 sm:px-6"><div className="mx-auto max-w-md"><Link href="/" className="inline-flex"><AppLogo /></Link><div className="mt-10 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#65816c]">{eyebrow}</p><h1 className="mt-3 font-display text-3xl tracking-[-0.03em]">{title}</h1><div className="mt-7">{children}</div>{footer}</div></div></div>;
}
