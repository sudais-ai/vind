import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default"|"outline"|"ghost"|"link"|"secondary"; size?: "default"|"sm"|"lg"|"icon"|"icon-sm"; asChild?: boolean; children?: ReactNode };
const styles = { default:"bg-primary text-primary-foreground hover:opacity-90", outline:"border border-border bg-transparent hover:bg-muted", ghost:"hover:bg-muted", link:"text-primary underline-offset-4 hover:underline", secondary:"bg-secondary text-secondary-foreground hover:bg-muted" };
const sizes = { default:"h-10 px-4", sm:"h-8 px-3", lg:"h-11 px-5", icon:"size-10", "icon-sm":"size-8" };
export function buttonVariants({ variant = "default", size = "default" }: { variant?: Props["variant"]; size?: Props["size"] } = {}) { return cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_*]:whitespace-nowrap", styles[variant ?? "default"], sizes[size ?? "default"]); }
export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant="default", size="default", asChild, children, ...props }, ref) { if (asChild && typeof children === "object" && children && "props" in children) return <span className={cn(buttonVariants({ variant, size }), className)}>{children}</span>; return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>{children}</button>; });
