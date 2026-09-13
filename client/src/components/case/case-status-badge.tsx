import { caseStatusLabels, type CaseStatus } from "@/types/vindicai";

const toneByStatus: Record<CaseStatus, string> = {
  draft: "bg-[#eef0ef] text-[#68736d]",
  active: "bg-[#e4eee5] text-[#55755d]",
  "pending-approval": "bg-[#f7ead9] text-[#976d38]",
  verified: "bg-[#dbe9d9] text-[#4f7158]",
  resolved: "bg-[#e6edf1] text-[#5c7890]",
  blocked: "bg-[#f8e5df] text-[#a45e4e]",
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${toneByStatus[status]}`}>
      {caseStatusLabels[status]}
    </span>
  );
}
