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

  it("allows decisions only for the assigned reviewer", () => {
    expect(
      getAuthorityApplicationActions("UNDER_REVIEW", "officer", 10, 10, null)
        .decideDcReview,
    ).toBe(true);
    expect(
      getAuthorityApplicationActions("UNDER_REVIEW", "officer", 11, 10, null)
        .hasActions,
    ).toBe(false);
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

  it("offers licence issuance only after appellate approval", () => {
    expect(
      getAuthorityApplicationActions(
        "APPELLATE_APPROVED",
        "appellate_officer",
        20,
        null,
        20,
      ).issueLicense,
    ).toBe(false);
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
});
