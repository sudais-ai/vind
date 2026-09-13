import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (email) setSent(true); };
  return <AuthLayout eyebrow="Account recovery" title={sent ? "Check your inbox" : "Reset your password"} footer={<p className="mt-7 text-center text-xs text-muted-foreground"><Link href="/auth/sign-in" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><ArrowLeft className="size-3" /> Back to sign in</Link></p>}>{sent ? <div className="rounded-md border border-[#cfdcca] bg-[#f1f6ef] p-5" role="status"><div className="flex size-10 items-center justify-center rounded-full bg-[#dbe9d9] text-[#55755d]"><CheckCircle2 className="size-5" /></div><h2 className="mt-4 text-sm font-semibold">Recovery link requested</h2><p className="mt-2 text-xs leading-6 text-muted-foreground">In a real environment, a secure reset link would be sent to <strong>{email}</strong>. This preview keeps the flow local.</p><Link href="/auth/reset-password"><Button className="mt-5 gap-2">Continue to reset <ArrowRight className="size-3.5" /></Button></Link></div> : <form className="space-y-4" onSubmit={submit}><p className="text-sm leading-7 text-muted-foreground">Enter the email associated with your workspace and we’ll show you the next step.</p><div className="space-y-2"><Label htmlFor="recovery-email">Work email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="h-11 bg-background pl-9" autoComplete="email" required /></div></div><Button type="submit" className="h-11 w-full gap-2">Send recovery link <ArrowRight className="size-4" /></Button></form>}</AuthLayout>;
}

export function ResetPassword() {
  const [saved, setSaved] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setSaved(true); };
  return <AuthLayout eyebrow="Account recovery" title={saved ? "Password updated" : "Choose a new password"} footer={<p className="mt-7 text-center text-xs text-muted-foreground"><Link href="/auth/sign-in" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><ArrowLeft className="size-3" /> Back to sign in</Link></p>}>{saved ? <div className="rounded-md border border-[#cfdcca] bg-[#f1f6ef] p-5" role="status"><CheckCircle2 className="size-5 text-[#55755d]" /><p className="mt-3 text-sm font-semibold">Your mock password has been updated.</p><Link href="/auth/sign-in"><Button className="mt-5 gap-2">Return to sign in <ArrowRight className="size-3.5" /></Button></Link></div> : <form className="space-y-4" onSubmit={submit}><div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" placeholder="At least 8 characters" minLength={8} className="h-11 bg-background" required /></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" placeholder="Repeat your password" minLength={8} className="h-11 bg-background" required /></div><Button type="submit" className="h-11 w-full gap-2">Update password <ArrowRight className="size-4" /></Button></form>}</AuthLayout>;
}
