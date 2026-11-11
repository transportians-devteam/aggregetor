import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileCheck2,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  loginDevelopment,
  registerDevelopment,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  DevelopmentRegistration,
} from "@/services/authService";
import {
  createApplication,
  submitApplication,
  uploadDocument,
  DocumentType,
} from "@/services/registrationService";
import { getErrorMessage } from "@/services/api";
import { z } from "zod";

const requiredDocuments: Array<{ type: DocumentType; label: string }> = [
  { type: "COMPANY_REGISTRATION", label: "Company registration certificate" },
  { type: "GST_CERTIFICATE", label: "GST certificate" },
  { type: "PAN_CERTIFICATE", label: "PAN certificate" },
  { type: "BANK_GUARANTEE", label: "Bank guarantee" },
];

const requiredBankGuarantee = (fleetSize: number) =>
  fleetSize < 1_000 ? 100_000 : fleetSize < 5_000 ? 250_000 : fleetSize <= 10_000 ? 500_000 : 1_000_000;

export const registrationSchema = z
  .object({
    companyName: z.string().trim().min(1, "Company name is required."),
    companyType: z.enum(["Aggregator", "DSP", "E-Commerce"]),
    registrationNumber: z
      .string()
      .trim()
      .min(1, "CIN or company registration number is required."),
    registeredAddress: z
      .string()
      .trim()
      .min(1, "Registered office address is required."),
    contactName: z
      .string()
      .trim()
      .min(1, "Authorised contact person name is required."),
    contactPhone: z
      .string()
      .trim()
      .regex(/^\d{10,15}$/, "Enter a valid 10 to 15 digit mobile number."),
    contactEmail: z
      .string()
      .trim()
      .email("Enter a valid email address (e.g. contact@company.in)."),
    declaredFleetSize: z
      .number()
      .min(26, "Declared fleet size must be at least 26 vehicles under the scheme."),
    categories: z
      .array(z.string())
      .min(1, "Select at least one vehicle category (2W, 3W, 4W)."),
    branchOfficeAddress: z
      .string()
      .trim()
      .min(1, "Branch or corporate office address within NCR is required."),
    officeInNcr: z
      .boolean()
      .refine((val) => val === true, "Confirmation of office location in NCR is required."),
    complianceOfficerName: z
      .string()
      .trim()
      .min(1, "Compliance officer name is required."),
    complianceOfficerDesignation: z
      .string()
      .trim()
      .min(1, "Compliance officer designation is required."),
    complianceOfficerPhone: z
      .string()
      .trim()
      .regex(/^\d{10,15}$/, "Enter a valid 10 to 15 digit phone number."),
    complianceOfficerEmail: z
      .string()
      .trim()
      .email("Enter a valid compliance officer email address."),
    bankGuaranteeNumber: z
      .string()
      .trim()
      .min(1, "Bank guarantee reference number is required."),
    bankGuaranteeBank: z
      .string()
      .trim()
      .min(1, "Issuing bank name is required."),
    bankGuaranteeAmount: z
      .number()
      .positive("Guarantee amount must be greater than 0."),
    bankGuaranteeValidUntil: z
      .string()
      .min(1, "Bank guarantee expiration date is required."),
    documents: z.object({
      COMPANY_REGISTRATION: z.instanceof(File, {
        message: "Please upload Company registration certificate (PDF, PNG, or JPEG).",
      }),
      GST_CERTIFICATE: z.instanceof(File, {
        message: "Please upload GST certificate (PDF, PNG, or JPEG).",
      }),
      PAN_CERTIFICATE: z.instanceof(File, {
        message: "Please upload PAN certificate (PDF, PNG, or JPEG).",
      }),
      BANK_GUARANTEE: z.instanceof(File, {
        message: "Please upload Bank guarantee (PDF, PNG, or JPEG).",
      }),
    }),
  })
  .superRefine((data, ctx) => {
    const minBg = requiredBankGuarantee(data.declaredFleetSize);
    if (data.bankGuaranteeAmount < minBg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Minimum deposit of ₹${minBg.toLocaleString("en-IN")} required for ${data.declaredFleetSize} vehicles.`,
        path: ["bankGuaranteeAmount"],
      });
    }
  });

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { auth, acceptSession } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState<
    "Aggregator" | "DSP" | "E-Commerce"
  >("Aggregator");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [declaredFleetSize, setDeclaredFleetSize] = useState(26);
  const [categories, setCategories] = useState<string[]>(["4W"]);
  const [branchOfficeAddress, setBranchOfficeAddress] = useState("");
  const [officeInNcr, setOfficeInNcr] = useState(false);
  const [complianceOfficerName, setComplianceOfficerName] = useState("");
  const [complianceOfficerDesignation, setComplianceOfficerDesignation] =
    useState("Compliance Officer");
  const [complianceOfficerPhone, setComplianceOfficerPhone] = useState("");
  const [complianceOfficerEmail, setComplianceOfficerEmail] = useState("");
  const [bankGuaranteeNumber, setBankGuaranteeNumber] = useState("");
  const [bankGuaranteeBank, setBankGuaranteeBank] = useState("");
  const [bankGuaranteeAmount, setBankGuaranteeAmount] = useState(0);
  const [bankGuaranteeValidUntil, setBankGuaranteeValidUntil] = useState("");
  const bankGuaranteeBeneficiary =
    "Commissioner of Transport, Government of NCT of Delhi";
  const [documents, setDocuments] = useState<
    Partial<Record<DocumentType, File>>
  >({});
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const uploadedCount = requiredDocuments.filter(
    ({ type }) => documents[type],
  ).length;

  const registration: DevelopmentRegistration = {
    companyName,
    companyType,
    cin: registrationNumber,
    regAddress: registeredAddress,
    contactName,
    contactPhone,
    contactEmail,
    categories,
  };

  const toggleCategory = (category: string) => {
    clearFieldError("categories");
    setCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  };

  const selectFile =
    (type: DocumentType) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setDocuments((current) => ({ ...current, [type]: file }));
        clearFieldError(type);
      }
    };

  const validate = (): Record<string, string> => {
    const result = registrationSchema.safeParse({
      companyName,
      companyType,
      registrationNumber,
      registeredAddress,
      contactName,
      contactPhone,
      contactEmail,
      declaredFleetSize,
      categories,
      branchOfficeAddress,
      officeInNcr,
      complianceOfficerName,
      complianceOfficerDesignation,
      complianceOfficerPhone,
      complianceOfficerEmail,
      bankGuaranteeNumber,
      bankGuaranteeBank,
      bankGuaranteeAmount,
      bankGuaranteeValidUntil,
      documents,
    });

    if (result.success) return {};

    const errs: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[issue.path.length - 1]);
      if (!errs[key]) {
        errs[key] = issue.message;
      }
    }
    return errs;
  };

  const ensureSession = async () => {
    if (auth.isLoggedIn) return;
    if (import.meta.env.DEV) {
      await registerDevelopment(registration);
      acceptSession(
        await loginDevelopment(
          contactPhone,
          companyType === "DSP" ? "dsp" : "aggregator",
        ),
      );
      return;
    }
    if (!challengeId) {
      const challenge = await requestRegistrationOtp(registration);
      setChallengeId(challenge.challengeId);
      throw new Error("OTP_SENT");
    }
    acceptSession(await verifyRegistrationOtp(challengeId, otp));
  };

  const submit = async () => {
    const errs = validate();
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      const missingDocCount = requiredDocuments.filter(({ type }) => errs[type]).length;
      const missingFieldCount = Object.keys(errs).length - missingDocCount;

      let summaryMsg = "Please complete all highlighted required fields and documents.";
      if (missingDocCount > 0 && missingFieldCount === 0) {
        summaryMsg = `Please upload the ${missingDocCount} missing document(s) highlighted below.`;
      } else if (missingDocCount > 0) {
        summaryMsg = `Please fill ${missingFieldCount} missing field(s) and upload ${missingDocCount} document(s) highlighted below.`;
      }

      setError(summaryMsg);
      toast.error(summaryMsg);

      // Smooth scroll to the first error
      const firstErrorKey = Object.keys(errs)[0];
      const targetElement =
        document.getElementById(`field-${firstErrorKey}`) ||
        document.getElementById(`doc-${firstErrorKey}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (challengeId && otp.length !== 6) {
      setError("Enter the six-digit registration OTP.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await ensureSession();
      const application = await createApplication({
        organizationType:
          companyType === "DSP"
            ? "DSP"
            : companyType === "E-Commerce"
              ? "E_COMMERCE"
              : "AGGREGATOR",
        companyName,
        registrationNumber,
        registeredAddress,
        contactName,
        contactPhone,
        contactEmail,
        declaredFleetSize,
        categories,
        officeInNcr,
        branchOfficeAddress,
        complianceOfficerName,
        complianceOfficerDesignation,
        complianceOfficerPhone,
        complianceOfficerEmail,
        bankGuaranteeNumber,
        bankGuaranteeBank,
        bankGuaranteeAmount,
        bankGuaranteeValidUntil,
        bankGuaranteeBeneficiary,
      });
      for (const { type } of requiredDocuments)
        await uploadDocument(application.id, type, documents[type]!);
      await submitApplication(application.id);
      toast.success("Application submitted successfully", {
        description: `Application Number: ${application.applicationNumber}`,
      });
      navigate("/dashboard");
    } catch (requestError) {
      if (
        requestError instanceof Error &&
        requestError.message === "OTP_SENT"
      ) {
        toast.success("OTP sent", {
          description: "Verify your phone to complete registration.",
        });
      } else
        setError(
          getErrorMessage(requestError, "Registration could not be completed."),
        );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] lg:flex">
      <aside
        className={`hidden min-h-screen shrink-0 flex-col justify-between bg-primary text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed
            ? "lg:w-20 p-4 items-center"
            : "lg:w-[36%] xl:w-[34%] p-8 xl:p-12"
        }`}
      >
        {sidebarCollapsed ? (
          <div className="flex h-full w-full flex-col items-center justify-between py-2">
            <div className="flex flex-col items-center gap-5">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-primary-foreground transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                title="Expand scheme overview & guidance"
              >
                <PanelLeftOpen className="h-5 w-5" />
                <span className="sr-only">Expand scheme guidance</span>
              </button>

              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2 border border-white/10 backdrop-blur-sm shadow-sm"
                title="Government of NCT of Delhi"
              >
                <img
                  src="/delhi-sarkar.png"
                  alt="Delhi Sarkar"
                  className="h-7 w-auto object-contain brightness-0 invert"
                />
              </div>

              <div className="flex flex-col items-center gap-3 pt-3">
                {[
                  { num: "1", title: "Account Verification" },
                  { num: "2", title: "Two-Step Scrutiny (DC & SCoT EV)" },
                  { num: "3", title: "Fleet Operations & 5-Yr Licence" },
                ].map((s) => (
                  <div
                    key={s.num}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[11px] font-bold text-white/80 cursor-default"
                    title={`Step ${s.num}: ${s.title}`}
                  >
                    {s.num}
                  </div>
                ))}
              </div>

              <div className="pt-6 [writing-mode:vertical-rl] rotate-180 text-[10px] font-semibold tracking-widest uppercase text-white/40 select-none">
                Delhi GACP Scheme
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Link
                to="/"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white"
                title="Back to portal"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="mb-8 flex items-center justify-between">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm opacity-70 transition hover:opacity-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to portal
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                  title="Minimize sidebar for full-width focus mode"
                >
                  <PanelLeftClose className="h-4 w-4" />
                  <span>Minimize</span>
                </button>
              </div>

              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2 backdrop-blur-sm border border-white/10">
                  <img
                    src="/delhi-sarkar.png"
                    alt="Delhi Sarkar"
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <strong className="block text-xl leading-none">GACP</strong>
                  <span className="text-[10px] opacity-70">
                    Government of NCT of Delhi
                  </span>
                </div>
              </div>

              <h1 className="font-heading text-4xl font-bold leading-tight">
                Apply for your Delhi aggregator licence.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed opacity-70">
                Complete organisation details, upload the prescribed documents and
                submit one secure digital application.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  [
                    "1",
                    "Account verification",
                    "Verified company identity, CIN and contact details.",
                  ],
                  [
                    "2",
                    "Two-Step Departmental Scrutiny",
                    "DC Level document verification followed by SCoT (EV) statutory licence approval.",
                  ],
                  [
                    "3",
                    "Fleet Operations & Reporting",
                    "5-year valid licence, live MIS reporting, driver onboarding and EV transition tracking.",
                  ],
                ].map(([num, title, desc]) => (
                  <div key={num} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 text-xs font-bold">
                      {num}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold">{title}</h4>
                      <p className="text-xs opacity-70 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/15 pt-6 text-xs opacity-65 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Delhi Motor Vehicle Aggregator & Delivery Scheme 2023</span>
              </div>
            </div>
          </>
        )}
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-heading font-bold text-primary"
          >
            <img
              src="/delhi-sarkar.png"
              alt="Delhi Sarkar"
              className="h-7 w-auto shrink-0 object-contain"
            />
            <span className="text-sm">GACP</span>
          </Link>
          <Link to="/login" className="text-sm font-semibold text-primary">
            Sign in
          </Link>
        </header>

        <div
          className={`mx-auto w-full px-4 py-7 sm:px-6 sm:py-10 lg:px-8 xl:py-12 transition-all duration-300 ${
            sidebarCollapsed ? "max-w-7xl" : "max-w-5xl"
          }`}
        >
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-accent">
                  Licence application
                </p>
                {sidebarCollapsed && (
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                    title="Show scheme guidance and steps"
                  >
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    <span>Show scheme guidance</span>
                  </button>
                )}
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                Register your organisation
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Account verification, document upload and application submission
                are completed in this regulated workflow.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-muted-foreground shadow-xs hover:text-foreground hover:bg-muted transition"
                  title="Collapse sidebar for wider view"
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                  <span>Focus mode</span>
                </button>
              )}
              <Link
                to="/login"
                className="hidden rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-muted lg:block"
              >
                Already registered? Sign in
              </Link>
            </div>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[1.08fr_.92fr]">
            {/* Left Column: Form Details */}
            <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-[0_12px_35px_rgba(15,60,40,.06)] sm:p-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold">
                    Organisation details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Applicant and primary contact information
                  </p>
                </div>
              </div>

              {/* Company Name */}
              <div id="field-companyName">
                <Label className={fieldErrors.companyName ? "text-destructive font-semibold" : ""}>
                  Company name
                </Label>
                <Input
                  className={`mt-1.5 transition-colors ${fieldErrors.companyName ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    clearFieldError("companyName");
                  }}
                  placeholder="Registered organisation name"
                />
                {fieldErrors.companyName && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fieldErrors.companyName}
                  </p>
                )}
              </div>

              {/* Type and CIN */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Organisation type</Label>
                  <select
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={companyType}
                    onChange={(e) =>
                      setCompanyType(
                        e.target.value as "Aggregator" | "DSP" | "E-Commerce",
                      )
                    }
                  >
                    <option>Aggregator</option>
                    <option>DSP</option>
                    <option>E-Commerce</option>
                  </select>
                </div>
                <div id="field-registrationNumber">
                  <Label className={fieldErrors.registrationNumber ? "text-destructive font-semibold" : ""}>
                    CIN / registration number
                  </Label>
                  <Input
                    className={`mt-1.5 transition-colors ${fieldErrors.registrationNumber ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                    value={registrationNumber}
                    onChange={(e) => {
                      setRegistrationNumber(e.target.value.toUpperCase());
                      clearFieldError("registrationNumber");
                    }}
                    placeholder="e.g. U74999DL2023PTC123456"
                  />
                  {fieldErrors.registrationNumber && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.registrationNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Registered Address */}
              <div id="field-registeredAddress">
                <Label className={fieldErrors.registeredAddress ? "text-destructive font-semibold" : ""}>
                  Registered address
                </Label>
                <Input
                  className={`mt-1.5 transition-colors ${fieldErrors.registeredAddress ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                  value={registeredAddress}
                  onChange={(e) => {
                    setRegisteredAddress(e.target.value);
                    clearFieldError("registeredAddress");
                  }}
                  placeholder="Official registered office address"
                />
                {fieldErrors.registeredAddress && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fieldErrors.registeredAddress}
                  </p>
                )}
              </div>

              {/* Contact Person & Mobile */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div id="field-contactName">
                  <Label className={fieldErrors.contactName ? "text-destructive font-semibold" : ""}>
                    Contact person
                  </Label>
                  <Input
                    className={`mt-1.5 transition-colors ${fieldErrors.contactName ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      clearFieldError("contactName");
                    }}
                    placeholder="Authorised primary contact"
                  />
                  {fieldErrors.contactName && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.contactName}
                    </p>
                  )}
                </div>
                <div id="field-contactPhone">
                  <Label className={fieldErrors.contactPhone ? "text-destructive font-semibold" : ""}>
                    Mobile number
                  </Label>
                  <Input
                    className={`mt-1.5 transition-colors ${fieldErrors.contactPhone ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value.replace(/\D/g, ""));
                      clearFieldError("contactPhone");
                    }}
                    placeholder="10 to 15 digits"
                    maxLength={15}
                  />
                  {fieldErrors.contactPhone && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.contactPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Fleet Size */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div id="field-contactEmail">
                  <Label className={fieldErrors.contactEmail ? "text-destructive font-semibold" : ""}>
                    Email address
                  </Label>
                  <Input
                    className={`mt-1.5 transition-colors ${fieldErrors.contactEmail ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                    type="email"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      clearFieldError("contactEmail");
                    }}
                    placeholder="contact@company.in"
                  />
                  {fieldErrors.contactEmail && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.contactEmail}
                    </p>
                  )}
                </div>
                <div id="field-declaredFleetSize">
                  <Label className={fieldErrors.declaredFleetSize ? "text-destructive font-semibold" : ""}>
                    Declared fleet size
                  </Label>
                  <Input
                    className={`mt-1.5 transition-colors ${fieldErrors.declaredFleetSize ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                    type="number"
                    min={26}
                    value={declaredFleetSize}
                    onChange={(e) => {
                      setDeclaredFleetSize(Number(e.target.value));
                      clearFieldError("declaredFleetSize");
                    }}
                  />
                  {fieldErrors.declaredFleetSize && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.declaredFleetSize}
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Categories */}
              <div id="field-categories">
                <Label className={fieldErrors.categories ? "text-destructive font-semibold" : ""}>
                  Vehicle categories
                </Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["2W", "3W", "4W"].map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                        categories.includes(category)
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "bg-background text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {fieldErrors.categories && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fieldErrors.categories}
                  </p>
                )}
              </div>

              {/* NCR Office & Compliance Officer */}
              <div className="border-t pt-5">
                <h4 className="font-semibold text-foreground">
                  NCR office and compliance officer
                </h4>
                <p className="mb-3 text-xs text-muted-foreground">
                  A corporate or branch office in NCR and a designated
                  compliance officer are mandatory.
                </p>
                <div id="field-branchOfficeAddress">
                  <Input
                    className={`transition-colors ${fieldErrors.branchOfficeAddress ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                    value={branchOfficeAddress}
                    onChange={(e) => {
                      setBranchOfficeAddress(e.target.value);
                      clearFieldError("branchOfficeAddress");
                    }}
                    placeholder="Corporate / branch office address within NCR"
                  />
                  {fieldErrors.branchOfficeAddress && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.branchOfficeAddress}
                    </p>
                  )}
                </div>

                <div id="field-officeInNcr">
                  <label className="mt-3 flex items-start gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={officeInNcr}
                      onChange={(e) => {
                        setOfficeInNcr(e.target.checked);
                        clearFieldError("officeInNcr");
                      }}
                      className="mt-1 accent-primary"
                    />
                    <span className={fieldErrors.officeInNcr ? "text-destructive font-medium" : ""}>
                      I confirm this office is located within the National Capital
                      Region.
                    </span>
                  </label>
                  {fieldErrors.officeInNcr && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldErrors.officeInNcr}
                    </p>
                  )}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div id="field-complianceOfficerName">
                    <Input
                      className={`transition-colors ${fieldErrors.complianceOfficerName ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      value={complianceOfficerName}
                      onChange={(e) => {
                        setComplianceOfficerName(e.target.value);
                        clearFieldError("complianceOfficerName");
                      }}
                      placeholder="Compliance officer name"
                    />
                    {fieldErrors.complianceOfficerName && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.complianceOfficerName}
                      </p>
                    )}
                  </div>

                  <div id="field-complianceOfficerDesignation">
                    <Input
                      className={`transition-colors ${fieldErrors.complianceOfficerDesignation ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      value={complianceOfficerDesignation}
                      onChange={(e) => {
                        setComplianceOfficerDesignation(e.target.value);
                        clearFieldError("complianceOfficerDesignation");
                      }}
                      placeholder="Designation"
                    />
                    {fieldErrors.complianceOfficerDesignation && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.complianceOfficerDesignation}
                      </p>
                    )}
                  </div>

                  <div id="field-complianceOfficerPhone">
                    <Input
                      className={`transition-colors ${fieldErrors.complianceOfficerPhone ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      value={complianceOfficerPhone}
                      onChange={(e) => {
                        setComplianceOfficerPhone(
                          e.target.value.replace(/\D/g, ""),
                        );
                        clearFieldError("complianceOfficerPhone");
                      }}
                      placeholder="Officer mobile number"
                      maxLength={15}
                    />
                    {fieldErrors.complianceOfficerPhone && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.complianceOfficerPhone}
                      </p>
                    )}
                  </div>

                  <div id="field-complianceOfficerEmail">
                    <Input
                      className={`transition-colors ${fieldErrors.complianceOfficerEmail ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      type="email"
                      value={complianceOfficerEmail}
                      onChange={(e) => {
                        setComplianceOfficerEmail(e.target.value);
                        clearFieldError("complianceOfficerEmail");
                      }}
                      placeholder="Officer email"
                    />
                    {fieldErrors.complianceOfficerEmail && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.complianceOfficerEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Guarantee Details */}
              <div className="border-t pt-5">
                <h4 className="font-semibold text-foreground">
                  Bank guarantee as security deposit
                </h4>
                <p className="mb-2 text-xs text-muted-foreground">
                  Beneficiary: {bankGuaranteeBeneficiary}
                </p>
                <p className="mb-3 rounded-lg bg-primary/5 p-2.5 text-xs font-medium text-primary border border-primary/20">
                  Required for {declaredFleetSize.toLocaleString("en-IN")} vehicles: ₹{requiredBankGuarantee(declaredFleetSize).toLocaleString("en-IN")}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div id="field-bankGuaranteeNumber">
                    <Input
                      className={`transition-colors ${fieldErrors.bankGuaranteeNumber ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      value={bankGuaranteeNumber}
                      onChange={(e) => {
                        setBankGuaranteeNumber(e.target.value.toUpperCase());
                        clearFieldError("bankGuaranteeNumber");
                      }}
                      placeholder="Guarantee reference number"
                    />
                    {fieldErrors.bankGuaranteeNumber && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.bankGuaranteeNumber}
                      </p>
                    )}
                  </div>

                  <div id="field-bankGuaranteeBank">
                    <Input
                      className={`transition-colors ${fieldErrors.bankGuaranteeBank ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      value={bankGuaranteeBank}
                      onChange={(e) => {
                        setBankGuaranteeBank(e.target.value);
                        clearFieldError("bankGuaranteeBank");
                      }}
                      placeholder="Issuing bank name"
                    />
                    {fieldErrors.bankGuaranteeBank && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.bankGuaranteeBank}
                      </p>
                    )}
                  </div>

                  <div id="field-bankGuaranteeAmount">
                    <Input
                      className={`transition-colors ${fieldErrors.bankGuaranteeAmount ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      type="number"
                      min={requiredBankGuarantee(declaredFleetSize)}
                      step="0.01"
                      value={bankGuaranteeAmount || ""}
                      onChange={(e) => {
                        setBankGuaranteeAmount(Number(e.target.value));
                        clearFieldError("bankGuaranteeAmount");
                      }}
                      placeholder="Guarantee amount (INR)"
                    />
                    {fieldErrors.bankGuaranteeAmount && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.bankGuaranteeAmount}
                      </p>
                    )}
                  </div>

                  <div id="field-bankGuaranteeValidUntil">
                    <Input
                      className={`transition-colors ${fieldErrors.bankGuaranteeValidUntil ? "border-destructive ring-1 ring-destructive/40 bg-destructive/[.02]" : ""}`}
                      type="date"
                      min={new Date(Date.now() + 86400000)
                        .toISOString()
                        .slice(0, 10)}
                      value={bankGuaranteeValidUntil}
                      onChange={(e) => {
                        setBankGuaranteeValidUntil(e.target.value);
                        clearFieldError("bankGuaranteeValidUntil");
                      }}
                    />
                    {fieldErrors.bankGuaranteeValidUntil && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive animate-in fade-in-50">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {fieldErrors.bankGuaranteeValidUntil}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Right Column: Mandatory Documents & Submission */}
            <section className="space-y-4 rounded-2xl border bg-white p-5 shadow-[0_12px_35px_rgba(15,60,40,.06)] sm:p-6 xl:sticky xl:top-8">
              <div className="flex items-center justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileCheck2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold">
                      Mandatory documents
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Upload PDF, PNG or JPEG files
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  uploadedCount === 4
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-primary/10 text-primary"
                }`}>
                  {uploadedCount}/4 Uploaded
                </span>
              </div>

              {/* Upload Cards with Individual Error Messages */}
              <div className="space-y-3">
                {requiredDocuments.map(({ type, label }) => {
                  const file = documents[type];
                  const hasError = Boolean(fieldErrors[type]);
                  return (
                    <div key={type} id={`doc-${type}`} className="space-y-1">
                      <label
                        className={`block cursor-pointer rounded-xl border p-4 transition ${
                          file
                            ? "border-emerald-500/50 bg-emerald-50/70 ring-1 ring-emerald-200"
                            : hasError
                              ? "border-destructive bg-destructive/5 ring-1 ring-destructive/40 shadow-sm"
                              : "bg-background hover:border-primary/40 hover:bg-primary/[.02]"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                              file
                                ? "bg-emerald-600 text-white shadow-sm"
                                : hasError
                                  ? "bg-destructive/10 text-destructive border border-destructive/30"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {file ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : hasError ? (
                              <AlertCircle className="h-4 w-4" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-1">
                              <b className={`block text-sm leading-tight ${hasError ? "text-destructive font-semibold" : ""}`}>
                                {label}
                              </b>
                              {file ? (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                                  READY
                                </span>
                              ) : hasError ? (
                                <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive shrink-0">
                                  MISSING
                                </span>
                              ) : null}
                            </span>
                            <small className="mt-1 block truncate text-muted-foreground">
                              {file?.name ?? "Choose a file to upload"}
                            </small>
                          </span>
                        </span>
                        <input
                          type="file"
                          accept="application/pdf,image/png,image/jpeg"
                          className="hidden"
                          onChange={selectFile(type)}
                        />
                      </label>
                      {hasError && (
                        <p className="flex items-center gap-1.5 px-1 text-xs font-semibold text-destructive animate-in fade-in-50">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {fieldErrors[type]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {challengeId && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <Label>Six-digit registration OTP</Label>
                  <Input
                    className="mt-1.5 bg-white"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="000000"
                  />
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Registration Incomplete
                  </div>
                  <p className="opacity-90 leading-relaxed">{error}</p>
                </div>
              )}

              <Button
                variant="accent"
                size="lg"
                className="w-full gap-2 shadow-sm font-semibold"
                onClick={submit}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileCheck2 className="h-4 w-4" />
                )}
                {challengeId
                  ? "Verify and submit application"
                  : "Submit application"}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                By submitting, you confirm that the information and documents
                provided are accurate according to Scheme rules.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
