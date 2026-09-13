import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";

export default function SignUp() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name || !form.email || form.password.length < 8) { setMessage("Add your name, a valid email, and a password of at least 8 characters."); return; } setMessage("Mock account created. Let’s set up your workspace."); window.setTimeout(() => navigate("/onboarding"), 500); };
  return <AuthLayout eyebrow="Start with clarity" title="Create your workspace" footer={<p className="mt-7 text-center text-xs text-muted-foreground">Already have an account? <Link href="/auth/sign-in" className="font-semibold text-primary hover:underline">Sign in</Link></p>}><form className="space-y-4" onSubmit={submit} noValidate><Button type="button" variant="outline" className="h-11 w-full gap-2 border-[#c8c2b7] bg-card"><Chrome className="size-4" /> Sign up with Google</Button><div className="flex items-center gap-3 py-2"><div className="h-px flex-1 bg-border" /><span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">or email</span><div className="h-px flex-1 bg-border" /></div><div className="space-y-2"><Label htmlFor="sign-up-name">Full name</Label><Input id="sign-up-name" value={form.name} onChange={update("name")} placeholder="Alex Morgan" autoComplete="name" className="h-11 bg-background" /></div><div className="space-y-2"><Label htmlFor="sign-up-email">Work email</Label><Input id="sign-up-email" type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" autoComplete="email" className="h-11 bg-background" /></div><div className="space-y-2"><Label htmlFor="sign-up-password">Password</Label><Input id="sign-up-password" type="password" value={form.password} onChange={update("password")} placeholder="At least 8 characters" autoComplete="new-password" className="h-11 bg-background" /></div>{message && <p className={`text-xs ${message.startsWith("Mock") ? "text-[#55755d]" : "text-destructive"}`} role="alert">{message}</p>}<Button type="submit" className="h-11 w-full gap-2 bg-primary">Create account <ArrowRight className="size-4" /></Button><p className="pt-2 text-center text-[11px] leading-5 text-muted-foreground">No real account is created in this preview. You can explore the onboarding flow with mock data.</p></form></AuthLayout>;
}
