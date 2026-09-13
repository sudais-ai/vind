import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineBanner, PageTransition } from "@/components/shared/product-states";
import { LoadingState } from "@/components/shared/loading-state";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Marketing from "./pages/Marketing";
import Home from "./pages/Home";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Cases = lazy(() => import("./pages/Cases"));
const CreateCase = lazy(() => import("./pages/CreateCase"));
const CaseRoom = lazy(() => import("./pages/CaseRoom"));
const EvidenceExplorer = lazy(() => import("./pages/EvidenceExplorer"));
const CaseTimeline = lazy(() => import("./pages/CaseTimeline"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(async () => ({ default: (await import("./pages/auth/PasswordRecovery")).ForgotPassword }));
const ResetPassword = lazy(async () => ({ default: (await import("./pages/auth/PasswordRecovery")).ResetPassword }));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ResearchCenter = lazy(() => import("./pages/ResearchCenter"));
const PolicyIntelligence = lazy(() => import("./pages/PolicyIntelligence"));
const CaseIntelligence = lazy(() => import("./pages/CaseIntelligence"));
const DraftEditor = lazy(() => import("./pages/DraftEditor"));
const ApprovalCenter = lazy(() => import("./pages/ApprovalCenter"));
const ActionCenter = lazy(() => import("./pages/ActionCenter"));
const ResponseTracking = lazy(() => import("./pages/ResponseTracking"));
const CaseStrategy = lazy(() => import("./pages/CaseStrategy"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const PhaseTwoControls = lazy(() => import("./pages/PhaseTwoControls"));
function Router() { return <Switch><Route path="/" component={Marketing} /><Route path="/preview" component={Home} /><Route path="/dashboard" component={Dashboard} /><Route path="/cases/new" component={CreateCase} /><Route path="/cases/:id/timeline" component={CaseTimeline} /><Route path="/cases/:id/evidence" component={EvidenceExplorer} /><Route path="/cases/:id/research" component={ResearchCenter} /><Route path="/cases/:id/intelligence" component={CaseIntelligence} /><Route path="/cases/:id/strategy" component={CaseStrategy} /><Route path="/cases/:id/drafts" component={DraftEditor} /><Route path="/cases/:id/approvals" component={ApprovalCenter} /><Route path="/cases/:id/actions" component={ActionCenter} /><Route path="/cases/:id/responses" component={ResponseTracking} /><Route path="/cases/:id" component={CaseRoom} /><Route path="/cases" component={Cases} /><Route path="/evidence" component={EvidenceExplorer} /><Route path="/timeline" component={CaseTimeline} /><Route path="/research" component={ResearchCenter} /><Route path="/policies" component={PolicyIntelligence} /><Route path="/drafts" component={DraftEditor} /><Route path="/approvals" component={ApprovalCenter} /><Route path="/actions" component={ActionCenter} /><Route path="/responses" component={ResponseTracking} /><Route path="/notifications" component={Notifications} /><Route path="/settings" component={Settings} /><Route path="/integrations" component={() => <PhaseTwoControls initialSection="integrations" />} /><Route path="/privacy" component={() => <PhaseTwoControls initialSection="privacy" />} /><Route path="/workspace" component={() => <PhaseTwoControls initialSection="workspace" />} /><Route path="/auth/sign-in" component={SignIn} /><Route path="/auth/sign-up" component={SignUp} /><Route path="/auth/forgot-password" component={ForgotPassword} /><Route path="/auth/reset-password" component={ResetPassword} /><Route path="/onboarding" component={Onboarding} /><Route path="/404" component={NotFound} /><Route><NotFound /></Route></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><OfflineBanner /><Suspense fallback={<LoadingState label="Opening workspace surface" detail="Loading the verified VindicAI record" />}><PageTransition><Router /></PageTransition></Suspense></TooltipProvider></ThemeProvider></ErrorBoundary>; }
