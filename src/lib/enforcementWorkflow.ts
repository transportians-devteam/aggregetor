import type { UserRole } from '@/services/authService';
import type { EnforcementCase } from '@/services/enforcementService';

export function getAuthorityEnforcementActions(item: EnforcementCase, role: UserRole | null,
  currentUserId: number | undefined) {
  const enforcementAuthority = role === 'enforcement' || role === 'admin';
  const appellateAuthority = role === 'appellate_officer' || role === 'admin';
  const activeSuspension = item.actions.some(action => action.type === 'SUSPENSION' && action.status === 'ACTIVE');
  const assignedReviewer = role === 'admin' || item.appeal?.reviewerUserId === currentUserId;
  const actions = {
    issuePenalty: enforcementAuthority && item.status === 'OPEN' && item.penalty === null,
    reviewResponse: enforcementAuthority && item.status === 'COMPLIANCE_REVIEW'
      && item.penalty?.status === 'RESPONSE_SUBMITTED',
    suspend: enforcementAuthority && item.status === 'ESCALATED',
    extendSuspension: enforcementAuthority && item.status === 'SUSPENDED' && activeSuspension,
    cancelLicense: enforcementAuthority && (item.status === 'ESCALATED' || item.status === 'SUSPENDED'),
    startAppealReview: appellateAuthority && item.status === 'APPEAL_PENDING'
      && item.appeal?.status === 'SUBMITTED',
    decideAppeal: appellateAuthority && item.status === 'APPEAL_PENDING'
      && item.appeal?.status === 'UNDER_REVIEW' && assignedReviewer,
  };
  return { ...actions, hasActions: Object.values(actions).some(Boolean) };
}

export function enforcementStatusMessage(item: EnforcementCase): string {
  if (item.status === 'PENALTY_ISSUED') return 'Waiting for the operator to pay or submit a compliance response.';
  if (item.status === 'COMPLIANCE_REVIEW') return 'The submitted compliance response is awaiting enforcement review.';
  if (item.status === 'APPEAL_PENDING' && item.appeal?.status === 'SUBMITTED') return 'The appeal is awaiting assignment.';
  if (item.status === 'APPEAL_PENDING' && item.appeal?.status === 'UNDER_REVIEW') return 'The assigned appellate reviewer must record the decision.';
  if (item.status === 'SUSPENDED') return 'The licence is suspended until the active action ends or is changed.';
  if (item.status === 'CANCELLED') return 'The licence is cancelled. No authority action is available unless an appeal is submitted.';
  if (item.status === 'CLOSED') return 'This enforcement case is closed and read-only.';
  return 'No action is available for your role at this stage.';
}
