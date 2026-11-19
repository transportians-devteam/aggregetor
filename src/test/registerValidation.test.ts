import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/pages/Register";

describe("registrationSchema Zod validation", () => {
  const dummyFile = new File(["dummy content"], "test.pdf", { type: "application/pdf" });

  const validPayload = {
    companyName: "Delhi Mobility Tech Pvt Ltd",
    companyType: "Aggregator" as const,
    registrationNumber: "U74999DL2023PTC123456",
    registeredAddress: "123 Connaught Place, New Delhi",
    contactName: "Rajesh Kumar",
    contactPhone: "9876543210",
    contactEmail: "rajesh@delhimobility.in",
    declaredFleetSize: 50,
    categories: ["4W"],
    branchOfficeAddress: "Tower A, Aerocity, New Delhi",
    officeInNcr: true,
    complianceOfficerName: "Anita Sharma",
    complianceOfficerDesignation: "Head of Compliance",
    complianceOfficerPhone: "9876543211",
    complianceOfficerEmail: "compliance@delhimobility.in",
    bankGuaranteeNumber: "BG-2026-DL-001",
    bankGuaranteeBank: "State Bank of India",
    bankGuaranteeAmount: 100000,
    bankGuaranteeValidUntil: "2027-11-04",
    documents: {
      COMPANY_REGISTRATION: dummyFile,
      GST_CERTIFICATE: dummyFile,
      PAN_CERTIFICATE: dummyFile,
      BANK_GUARANTEE: dummyFile,
    },
  };

  it("passes validation with complete valid payload", () => {
    const result = registrationSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("identifies missing documents individually with precise error messages", () => {
    const payloadWithoutGst = {
      ...validPayload,
      documents: {
        COMPANY_REGISTRATION: dummyFile,
        PAN_CERTIFICATE: dummyFile,
        BANK_GUARANTEE: dummyFile,
      },
    };

    const result = registrationSchema.safeParse(payloadWithoutGst);
    expect(result.success).toBe(false);
    if (!result.success) {
      const gstIssue = result.error.issues.find(
        (i) => i.path.includes("GST_CERTIFICATE") || i.path[i.path.length - 1] === "GST_CERTIFICATE",
      );
      expect(gstIssue).toBeDefined();
      expect(gstIssue?.message).toContain("GST certificate");
    }
  });

  it("enforces fleet size minimum of 26", () => {
    const invalidFleet = {
      ...validPayload,
      declaredFleetSize: 15,
    };
    const result = registrationSchema.safeParse(invalidFleet);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fleetIssue = result.error.issues.find((i) => i.path.includes("declaredFleetSize"));
      expect(fleetIssue?.message).toContain("at least 26 vehicles");
    }
  });

  it("enforces bank guarantee amount matching fleet slab", () => {
    // For 1001 vehicles, min bank guarantee is 250,000
    const invalidBgAmount = {
      ...validPayload,
      declaredFleetSize: 1500,
      bankGuaranteeAmount: 100000,
    };
    const result = registrationSchema.safeParse(invalidBgAmount);
    expect(result.success).toBe(false);
    if (!result.success) {
      const bgIssue = result.error.issues.find((i) => i.path.includes("bankGuaranteeAmount"));
      expect(bgIssue?.message).toContain("Minimum deposit of ₹2,50,000 required");
    }
  });
});

