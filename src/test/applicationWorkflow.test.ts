import { describe, expect, it } from "vitest";
import { getAuthorityApplicationActions } from "@/lib/applicationWorkflow";

describe("authority application actions", () => {
  it("makes issued licences read-only for every authority role", () => {
    for (const role of ["officer", "appellate_officer", "admin"] as const) {
      expect(
        getAuthorityApplicationActions("LICENSE_ISSUED", role, 10, 10, 10)
          .hasActions,
      ).toBe(false);
    }
  });

  it("allows an officer to start only a submitted departmental review", () => {
    expect(
      getAuthorityApplicationActions("SUBMITTED", "officer", 10, null, null)
        .startDcReview,
    ).toBe(true);
    expect(
      getAuthorityApplicationActions(
        "APPELLATE_REVIEW_PENDING",
        "officer",
        10,
        10,
        null,
      ).hasActions,
    ).toBe(false);
  });

  it("allows DC scrutiny actions for DC officers and restricts appellate review to assigned reviewer", () => {
    // Any DC scrutiny officer on duty can review applications under review
    expect(
      getAuthorityApplicationActions("UNDER_REVIEW", "officer", 10, 10, null)
        .decideDcReview,
    ).toBe(true);
    expect(
      getAuthorityApplicationActions("UNDER_REVIEW", "officer", 11, 10, null)
        .decideDcReview,
    ).toBe(true);
    expect(
      getAuthorityApplicationActions("UNDER_REVIEW", "officer", 11, 10, null)
        .reviewDocuments,
    ).toBe(true);
    // SCoT / Admin cannot verify documents directly during DC scrutiny
    expect(
      getAuthorityApplicationActions("UNDER_REVIEW", "admin", 99, 10, null)
        .reviewDocuments,
    ).toBe(false);

    // Appellate review enforces assigned appellate officer
    expect(
      getAuthorityApplicationActions(
        "UNDER_APPELLATE_REVIEW",
        "appellate_officer",
        20,
        null,
        20,
      ).decideAppellateReview,
    ).toBe(true);
    expect(
      getAuthorityApplicationActions(
        "UNDER_APPELLATE_REVIEW",
        "appellate_officer",
        21,
        null,
        20,
      ).hasActions,
    ).toBe(false);
  });

  it("offers licence issuance after DC scrutiny to SCoT and after appellate approval", () => {
    // SCoT (Admin) can issue licence when DC scrutiny completes (DC_APPROVED)
    const scotDcApproved = getAuthorityApplicationActions("DC_APPROVED", "admin", 99, 10, null);
    expect(scotDcApproved.issueLicense).toBe(true);
    expect(scotDcApproved.decideScotReview).toBe(true);

    // DC Officer cannot issue licence once DC_APPROVED
    const officerDcApproved = getAuthorityApplicationActions("DC_APPROVED", "officer", 10, 10, null);
    expect(officerDcApproved.hasActions).toBe(false);

    // Appellate approval allows licence issuance
    expect(
      getAuthorityApplicationActions(
        "APPELLATE_APPROVED",
        "appellate_officer",
        20,
        null,
        20,
      ).issueLicense,
    ).toBe(true);

    // Appellate rejection is final
    expect(
      getAuthorityApplicationActions(
        "APPELLATE_REJECTED",
        "appellate_officer",
        20,
        null,
        20,
      ).hasActions,
    ).toBe(false);
  });

  it("routes a DC rejection directly to its assigned appellate authority", () => {
    expect(
      getAuthorityApplicationActions(
        "UNDER_APPELLATE_REVIEW",
        "appellate_officer",
        20,
        10,
        20,
      ).decideAppellateReview,
    ).toBe(true);
    expect(
      getAuthorityApplicationActions(
        "UNDER_APPELLATE_REVIEW",
        "appellate_officer",
        21,
        10,
        20,
      ).hasActions,
    ).toBe(false);
  });

  it("restricts document review strictly to the DC officer while keeping SCoT (EV) as the final approval authority", () => {
    const officerActions = getAuthorityApplicationActions("UNDER_REVIEW", "officer", 10, 10, null);
    expect(officerActions.reviewDocuments).toBe(true);
    expect(officerActions.decideDcReview).toBe(true);

    const scotActions = getAuthorityApplicationActions("UNDER_REVIEW", "admin", 99, 10, null);
    expect(scotActions.reviewDocuments).toBe(false);
    expect(scotActions.decideDcReview).toBe(true);
  });
});
