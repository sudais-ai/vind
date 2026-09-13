import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Chrome, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";

export default function SignIn() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (!email || !password) { setMessage("Enter your email and password to continue."); return; } setMessage("Mock sign-in complete. Continue to workspace setup."); window.setTimeout(() => navigate("/onboarding"), 500); };
  return <AuthLayout eyebrow="Welcome back" title="Sign in to your workspace" footer={<p className="mt-7 text-center text-xs text-muted-foreground">New to VindicAI? <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">Create an account</Link></p>}><form className="space-y-4" onSubmit={submit} noValidate><Button type="button" variant="outline" className="h-11 w-full gap-2 border-[#c8c2b7] bg-card"><Chrome className="size-4" /> Continue with Google</Button><div className="flex items-center gap-3 py-2"><div className="h-px flex-1 bg-border" /><span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">or email</span><div className="h-px flex-1 bg-border" /></div><div className="space-y-2"><Label htmlFor="sign-in-email">Work email</Label><Input id="sign-in-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" aria-invalid={Boolean(message && !email)} className="h-11 bg-background" /></div><div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="sign-in-password">Password</Label><Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link></div><div className="relative"><Input id="sign-in-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" aria-invalid={Boolean(message && !password)} className="h-11 bg-background pr-10" /><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>{message && <p className={`text-xs ${message.startsWith("Mock") ? "text-[#55755d]" : "text-destructive"}`} role="alert">{message}</p>}<Button type="submit" className="mt-2 h-11 w-full gap-2 bg-primary">Sign in <ArrowRight className="size-4" /></Button><p className="pt-2 text-center text-[11px] leading-5 text-muted-foreground">By continuing, you agree to keep workspace decisions human-controlled.</p></form></AuthLayout>;
}
