import type { UserRole } from '@/services/authService';
import type { ApplicationStatus } from '@/services/registrationService';

export function getAuthorityApplicationActions(status: ApplicationStatus, role: UserRole | null, currentUserId: number | undefined,
  assignedOfficerUserId: number | null, assignedAppellateUserId: number | null) {
  const dcAuthority = role === 'officer' || role === 'admin';
  const appellateAuthority = role === 'appellate_officer' || role === 'admin';
  const actions = {
    startDcReview: dcAuthority && status === 'SUBMITTED',
    reviewDocuments: dcAuthority && status === 'UNDER_REVIEW' && assignedOfficerUserId === currentUserId,
    decideDcReview: dcAuthority && status === 'UNDER_REVIEW' && assignedOfficerUserId === currentUserId,
    startAppellateReview: appellateAuthority && (status === 'APPELLATE_REVIEW_PENDING' || status === 'APPEAL_SUBMITTED'),
    decideAppellateReview: appellateAuthority && status === 'UNDER_APPELLATE_REVIEW' && assignedAppellateUserId === currentUserId,
    issueLicense: false,
  };
  return { ...actions, hasActions: Object.values(actions).some(Boolean) };
}

export function authorityApplicationMessage(status: ApplicationStatus): string {
  switch (status) {
    case 'DRAFT': return 'The applicant is still preparing this application.';
    case 'DEFICIENCY_RAISED': return 'Waiting for the applicant to correct the deficiency and resubmit.';
    case 'DC_APPROVED': return 'Departmental approval is complete and the five-year licence is being issued.';
    case 'DC_REJECTED': return 'Legacy rejected application awaiting migration to appellate review.';
    case 'APPELLATE_REVIEW_PENDING': return 'Legacy application awaiting appellate assignment.';
    case 'APPEAL_SUBMITTED': return 'The applicant has submitted an appeal for appellate review.';
    case 'APPELLATE_APPROVED': return 'Appellate approval is complete and the five-year licence is being issued.';
    case 'APPELLATE_REJECTED': return 'The appellate decision is final. No further authority action is available.';
    case 'LICENSE_ISSUED': return 'The licence has already been issued. This application is read-only.';
    default: return 'No action is available for your role at this stage.';
  }
}
