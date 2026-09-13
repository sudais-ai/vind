import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.domain.ai_controls import AIRecommendationType, assert_ai_recommendation
from app.domain.case_state import CaseState, CaseStateMachine, InvalidCaseTransition


try:
    CaseStateMachine.transition(CaseState.NEW, CaseState.RESEARCHING)
except InvalidCaseTransition as error:
    assert "NEW -> RESEARCHING" in str(error)
    assert "required prior lifecycle step" in str(error)
else:
    raise AssertionError("invalid NEW -> RESEARCHING transition was accepted")

state = CaseState.NEW
for target in (CaseState.INGESTING, CaseState.FACTS_EXTRACTED, CaseState.EVIDENCE_VERIFIED, CaseState.RESEARCHING):
    state = CaseStateMachine.transition(state, target)
assert state is CaseState.RESEARCHING

try:
    assert_ai_recommendation(AIRecommendationType.STRATEGY, authority="external_send")
except PermissionError:
    pass
else:
    raise AssertionError("AI authority control did not reject external send")

print("case state machine: invalid transition rejected; valid path accepted; AI authority guard passed")
