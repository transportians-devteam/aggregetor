import { describe, expect, it } from "vitest";
import { getAuthorityEnforcementActions } from "@/lib/enforcementWorkflow";
import type { EnforcementCase } from "@/services/enforcementService";

const enforcementCase = (
  overrides: Partial<EnforcementCase> = {},
): EnforcementCase => ({
  id: "case-1",
  caseNumber: "ENF-TEST",
  ownerUserId: 10,
  source: "PORTAL",
  sourceReference: null,
  violationCode: "TEST",
  description: "Test violation",
  status: "OPEN",
  createdAt: "2026-08-17T00:00:00Z",
  penalty: null,
  actions: [],
  appeal: null,
  ...overrides,
});

describe("authority enforcement actions", () => {
  it("makes closed cases read-only for all authority roles", () => {
    for (const role of ["enforcement", "appellate_officer", "admin"] as const) {
      expect(
        getAuthorityEnforcementActions(
          enforcementCase({ status: "CLOSED" }),
          role,
          1,
        ).hasActions,
      ).toBe(false);
    }
  });

  it("offers enforcement actions only at their valid transitions", () => {
    expect(
      getAuthorityEnforcementActions(enforcementCase(), "enforcement", 1)
        .issuePenalty,
    ).toBe(true);
    expect(
      getAuthorityEnforcementActions(
        enforcementCase({ status: "PENALTY_ISSUED" }),
        "enforcement",
        1,
      ).hasActions,
    ).toBe(false);
    expect(
      getAuthorityEnforcementActions(
        enforcementCase({ status: "ESCALATED" }),
        "enforcement",
        1,
      ).suspend,
    ).toBe(true);
  });

  it("shows suspension extension only for an active suspension", () => {
    const item = enforcementCase({
      status: "SUSPENDED",
      actions: [
        {
          id: "action-1",
          type: "SUSPENSION",
          status: "ACTIVE",
          reason: "Default",
          effectiveFrom: "2026-08-01",
          effectiveUntil: "2026-09-01",
        },
      ],
    });
    expect(
      getAuthorityEnforcementActions(item, "enforcement", 1).extendSuspension,
    ).toBe(true);
  });

  it("allows only the assigned appellate reviewer to decide, with an admin override", () => {
    const item = enforcementCase({
      status: "APPEAL_PENDING",
      appeal: {
        id: "appeal-1",
        grounds: "Incorrect order",
        status: "UNDER_REVIEW",
        reviewerUserId: 20,
        decisionReason: null,
        submittedAt: "2026-08-17T00:00:00Z",
        decidedAt: null,
      },
    });
    expect(
      getAuthorityEnforcementActions(item, "appellate_officer", 20)
        .decideAppeal,
    ).toBe(true);
    expect(
      getAuthorityEnforcementActions(item, "appellate_officer", 21).hasActions,
    ).toBe(false);
    expect(getAuthorityEnforcementActions(item, "admin", 21).decideAppeal).toBe(
      true,
    );
  });
});
