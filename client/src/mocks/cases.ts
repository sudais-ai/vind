import type { CaseSummary } from "@/types/vindicai";
import { caseDetails } from "./workspace";

export const mockCases: CaseSummary[] = caseDetails.slice(0, 3).map(({ verifiedFacts: _facts, openQuestions: _questions, aiRecommendation: _recommendation, milestones: _milestones, claims: _claims, nextActions: _actions, drafts: _drafts, ...summary }) => summary);
