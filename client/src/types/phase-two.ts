export type ConnectionState = "NOT_CONNECTED" | "CONNECTING" | "CONNECTED" | "PERMISSION_REQUIRED" | "ERROR" | "DISCONNECTED";
export type ExportState = "Idle" | "Preparing" | "Ready" | "Failed";
export type ConsentStage = "Connect Gmail" | "Review Access" | "Understand Data Usage" | "Confirm" | "Connected";
export type WorkspaceRole = "OWNER" | "ADMIN" | "MANAGER" | "REVIEWER" | "MEMBER" | "VIEWER";
export type MemberStatus = "Active" | "Invited" | "Suspended";
export type PermissionGroup = "Cases" | "Evidence" | "Research" | "Actions" | "Approvals" | "Integrations" | "Administration";
export type RiskTier = "Low" | "Medium" | "High" | "Critical";
export interface IntegrationPermission { label: string; detail: string; enabled: boolean }
export interface IntegrationRecord { id: string; name: string; provider: string; state: ConnectionState; account?: string; lastSync?: string; connectedDate?: string; permissions: IntegrationPermission[] }
export interface DataOverviewItem { label: string; detail: string; count: string; tone: "neutral" | "verified" | "review" }
export interface AccessRecord { id: string; actor: string; action: string; resource: string; timestamp: string; reason: string }
export interface WorkspaceMember { id: string; name: string; email: string; role: WorkspaceRole; status: MemberStatus; joined: string; team: string }
export interface WorkspaceTeam { id: string; name: string; detail: string; members: number; lead: string }
export interface PermissionRule { group: PermissionGroup; see: string; edit: string; approve: string; execute: string }
export interface ApprovalPolicy { tier: RiskTier; rule: string; approvers: string; accent: string }
export interface AnalyticsMetric { label: string; value: string; detail: string; change: string }
