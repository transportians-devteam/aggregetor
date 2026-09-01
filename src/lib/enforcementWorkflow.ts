import type { UserRole } from '@/services/authService';
import type { EnforcementCase } from '@/services/enforcementService';

export function getAuthorityEnforcementActions(item: EnforcementCase, role: UserRole | null,
  currentUserId: number | undefined) {
  const enforcementAuthority = role === 'enforcement' || role === 'admin';
  const appellateAuthority = role === 'appellate_officer' || role === 'admin';
  const activeSuspension = item.actions.some(action => action.type === 'SUSPENSION' && action.status === 'ACTIVE');
  const showCauseReplyPending = item.status === 'COMPLIANCE_REVIEW'
    && item.penalty?.status === 'RESPONSE_SUBMITTED';
  const restorationPending = item.status === 'COMPLIANCE_REVIEW'
    && item.restorationSubmittedAt !== null && item.penalty?.status === 'DEFAULTED';
  const assignedReviewer = role === 'admin' || item.appeal?.reviewerUserId === currentUserId;
  const actions = {
    issuePenalty: enforcementAuthority && item.status === 'OPEN' && item.penalty === null,
    issueShowCause: enforcementAuthority && item.status === 'OPEN' && item.penalty === null,
    reviewResponse: enforcementAuthority && showCauseReplyPending,
    reviewRestoration: enforcementAuthority && restorationPending,
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
  if (item.status === 'PENALTY_ISSUED') return 'Waiting for the operator to reply to the show-cause notice or pay the monetary penalty.';
  if (item.status === 'COMPLIANCE_REVIEW' && item.restorationSubmittedAt) return 'The compliance report and Form 4 undertaking are awaiting Authority review.';
  if (item.status === 'COMPLIANCE_REVIEW') return 'The show-cause reply is awaiting Authority review.';
  if (item.status === 'APPEAL_PENDING' && item.appeal?.status === 'SUBMITTED') return 'The appeal is awaiting assignment.';
  if (item.status === 'APPEAL_PENDING' && item.appeal?.status === 'UNDER_REVIEW') return 'The assigned appellate reviewer must record the decision.';
  if (item.status === 'SUSPENDED') return 'Operations are blocked until a compliance report and Form 4 undertaking are approved.';
  if (item.status === 'CANCELLED') return 'The licence is cancelled. No authority action is available unless an appeal is submitted.';
  if (item.status === 'CLOSED') return 'This enforcement case is closed and read-only.';
  return 'No action is available for your role at this stage.';
}
