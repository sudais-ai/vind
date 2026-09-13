import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { hasError: boolean; errorMessage?: string };

export default class ErrorBoundary extends Component<Props, State> { state: State = { hasError: false }; static getDerivedStateFromError(error: Error): State { return { hasError: true, errorMessage: error.message }; } componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() { if (!this.state.hasError) return this.props.children; return <div className="min-h-screen bg-background px-4 py-16"><main className="mx-auto max-w-xl rounded-lg border border-[#ead1cb] bg-[#fdf5f2] p-7 text-center surface-grid sm:p-10" role="alert"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f8e7e2] text-[#a84e43]"><AlertTriangle className="size-6" /></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a84e43]">Recovery required</p><h1 className="mt-2 font-display text-3xl">This workspace surface hit an unexpected error.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">No action was marked as saved. Refresh the mock workspace or return to the dashboard and try the step again.</p>{this.state.errorMessage && <p className="mx-auto mt-4 max-w-md rounded-md border border-[#ead1cb] bg-white/60 p-3 text-left text-[11px] text-[#8f3d35]">Technical detail: {this.state.errorMessage}</p>}<div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={() => window.location.reload()} className="gap-2"><RefreshCcw className="size-4" />Refresh workspace</Button><Button variant="outline" className="gap-2" onClick={() => { window.location.href = "/dashboard"; }}><ArrowLeft className="size-4" />Back to dashboard</Button></div></main></div>; }
}
