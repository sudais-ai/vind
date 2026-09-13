export type NotificationCategory = "CASE" | "EVIDENCE" | "RESEARCH" | "POLICY" | "APPROVAL" | "ACTION" | "RESPONSE" | "DEADLINE" | "SECURITY" | "SYSTEM";
export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export type NotificationGroup = "Today" | "Yesterday" | "Earlier";
export interface NotificationRecord { id: string; category: NotificationCategory; priority: NotificationPriority; title: string; detail: string; timestamp: string; group: NotificationGroup; read: boolean; destination: string; caseId?: string; }

const seed: NotificationRecord[] = [
  { id: "n-1", category: "APPROVAL", priority: "CRITICAL", title: "Approval required", detail: "Review the Vendor data export exception before its action can move forward.", timestamp: "8 min ago", group: "Today", read: false, destination: "/cases/case-1048/approvals", caseId: "case-1048" },
  { id: "n-2", category: "EVIDENCE", priority: "HIGH", title: "Evidence verified", detail: "The September statement pair now supports the correction request.", timestamp: "42 min ago", group: "Today", read: false, destination: "/cases/case-1048/evidence", caseId: "case-1048" },
  { id: "n-3", category: "POLICY", priority: "NORMAL", title: "Policy changed", detail: "Billing Terms v3.2 has a new §4.2 review requirement.", timestamp: "2 hours ago", group: "Today", read: true, destination: "/policies" },
  { id: "n-4", category: "DEADLINE", priority: "HIGH", title: "Deadline approaching", detail: "Asteria renewal acceptance is due tomorrow.", timestamp: "Yesterday", group: "Yesterday", read: false, destination: "/cases/case-1041/approvals", caseId: "case-1041" },
  { id: "n-5", category: "RESEARCH", priority: "NORMAL", title: "Source went stale", detail: "The migration note still needs a primary source before it can be cited.", timestamp: "Yesterday", group: "Yesterday", read: true, destination: "/cases/case-1048/research", caseId: "case-1048" },
  { id: "n-6", category: "RESPONSE", priority: "NORMAL", title: "Response received", detail: "Finance replied to the internal evidence request.", timestamp: "Sep 08", group: "Earlier", read: true, destination: "/cases/case-1048/responses", caseId: "case-1048" },
  { id: "n-7", category: "CASE", priority: "HIGH", title: "Case needs review", detail: "Northwind Utilities has an unresolved causal claim.", timestamp: "Sep 07", group: "Earlier", read: false, destination: "/cases/case-1048", caseId: "case-1048" },
  { id: "n-8", category: "ACTION", priority: "NORMAL", title: "Action completed", detail: "The service credit exception was recorded for Meridian Air.", timestamp: "Sep 06", group: "Earlier", read: true, destination: "/actions" },
  { id: "n-9", category: "SECURITY", priority: "LOW", title: "New sign-in confirmed", detail: "Alex Morgan signed in from the approved workspace device.", timestamp: "Sep 05", group: "Earlier", read: true, destination: "/settings?section=security" },
  { id: "n-10", category: "SYSTEM", priority: "NORMAL", title: "Workspace sync complete", detail: "All mock records are ready for review.", timestamp: "Sep 04", group: "Earlier", read: true, destination: "/dashboard" },
  { id: "n-11", category: "EVIDENCE", priority: "HIGH", title: "Missing evidence", detail: "A supporting ledger record is still required for the proposed remedy.", timestamp: "Sep 03", group: "Earlier", read: false, destination: "/cases/case-1048/evidence", caseId: "case-1048" },
  { id: "n-12", category: "ACTION", priority: "CRITICAL", title: "Action failed", detail: "Outbound send was blocked because human approval is still pending.", timestamp: "Sep 02", group: "Earlier", read: true, destination: "/cases/case-1048/actions", caseId: "case-1048" },
];
let records = [...seed];
const listeners = new Set<() => void>();
const notify = () => { if (typeof window !== "undefined") window.localStorage.setItem("vindicai:notifications", JSON.stringify(records)); listeners.forEach((listener) => listener()); };
if (typeof window !== "undefined") { const stored = window.localStorage.getItem("vindicai:notifications"); if (stored) { try { records = JSON.parse(stored) as NotificationRecord[]; } catch { window.localStorage.removeItem("vindicai:notifications"); } } }
export const notificationCategories: NotificationCategory[] = ["CASE", "EVIDENCE", "RESEARCH", "POLICY", "APPROVAL", "ACTION", "RESPONSE", "DEADLINE", "SECURITY", "SYSTEM"];
export const notificationPriorities: NotificationPriority[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
export const mockNotificationsService = { async list() { return { data: [...records], source: "mock" as const, generatedAt: new Date().toISOString() }; }, markRead(id: string) { records = records.map((item) => item.id === id ? { ...item, read: true } : item); notify(); }, markAllRead() { records = records.map((item) => ({ ...item, read: true })); notify(); }, subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; } };
