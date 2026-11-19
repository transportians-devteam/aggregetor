import type { UserRole } from "@/services/authService";
import type { ApplicationStatus } from "@/services/registrationService";

export function getAuthorityApplicationActions(
  status: ApplicationStatus,
  role: UserRole | null,
  currentUserId: number | undefined,
  assignedOfficerUserId: number | null,
  assignedAppellateUserId: number | null,
) {
  const isOfficer = role === "officer";
  const isAdmin = role === "admin";
  const dcAuthority = isOfficer || isAdmin;
  const appellateAuthority = role === "appellate_officer" || isAdmin;
  const actions = {
    // Only DC Officers initiate DC Level document scrutiny
    startDcReview: isOfficer && status === "SUBMITTED",
    // DC Officers in the scrutiny desk verify individual documents; SCoT (EV) has oversight
    reviewDocuments: isOfficer && status === "UNDER_REVIEW",
    // Step 1: DC Scrutiny decision (DC Officer or Admin during UNDER_REVIEW)
    decideDcReview: dcAuthority && status === "UNDER_REVIEW",
    // Step 2: SCoT (EV) statutory licence approval after DC scrutiny completes (status === 'DC_APPROVED')
    issueLicense:
      (isAdmin && status === "DC_APPROVED") ||
      (appellateAuthority && status === "APPELLATE_APPROVED"),
    // SCoT / Admin can also send back for deficiency or reject at DC_APPROVED stage
    decideScotReview: isAdmin && status === "DC_APPROVED",
    startAppellateReview:
      appellateAuthority &&
      (status === "APPELLATE_REVIEW_PENDING" || status === "APPEAL_SUBMITTED"),
    decideAppellateReview:
      appellateAuthority &&
      status === "UNDER_APPELLATE_REVIEW" &&
      (assignedAppellateUserId === currentUserId || isAdmin),
  };
  return { ...actions, hasActions: Object.values(actions).some(Boolean) };
}

export function authorityApplicationMessage(status: ApplicationStatus): string {
  switch (status) {
    case "DRAFT":
      return "The applicant is still preparing this application.";
    case "DEFICIENCY_RAISED":
      return "Waiting for the applicant to correct the deficiency and resubmit.";
    case "DC_APPROVED":
      return "DC scrutiny complete; awaiting SCoT (EV) statutory licence approval.";
    case "DC_REJECTED":
      return "Rejected by the department; awaiting operator appeal to Appellate Authority.";
    case "APPELLATE_REVIEW_PENDING":
      return "Application awaiting appellate review assignment.";
    case "APPEAL_SUBMITTED":
      return "The applicant has submitted an appeal for appellate review.";
    case "APPELLATE_APPROVED":
      return "Appellate approval granted; five-year licence being issued.";
    case "APPELLATE_REJECTED":
      return "The appellate decision is final. No further authority action is available.";
    case "LICENSE_ISSUED":
      return "The five-year licence has already been issued. This application is read-only.";
    default:
      return "No action is available for your role at this stage.";
  }
}
