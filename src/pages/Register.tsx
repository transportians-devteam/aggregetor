import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileCheck2,
  Loader2,
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

const requiredDocuments: Array<{ type: DocumentType; label: string }> = [
  { type: "COMPANY_REGISTRATION", label: "Company registration certificate" },
  { type: "GST_CERTIFICATE", label: "GST certificate" },
  { type: "PAN_CERTIFICATE", label: "PAN certificate" },
  { type: "BANK_GUARANTEE", label: "Bank guarantee" },
];

const requiredBankGuarantee = (fleetSize: number) =>
  fleetSize < 1_000 ? 100_000 : fleetSize < 5_000 ? 250_000 : fleetSize <= 10_000 ? 500_000 : 1_000_000;

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
    setCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  };

  const selectFile =
    (type: DocumentType) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) setDocuments((current) => ({ ...current, [type]: file }));
    };

  const validate = () => {
    if (
      !companyName ||
      !registrationNumber ||
      !registeredAddress ||
      !contactName ||
      !contactEmail ||
      !/^\d{10,15}$/.test(contactPhone)
    )
      return "Complete all company and contact fields.";
    if (declaredFleetSize < 26)
      return "The declared fleet size must be at least 26.";
    if (!categories.length) return "Select at least one vehicle category.";
    if (!officeInNcr || !branchOfficeAddress.trim())
      return "Confirm and provide the corporate or branch office address within NCR.";
    if (
      !complianceOfficerName ||
      !complianceOfficerDesignation ||
      !complianceOfficerEmail ||
      !/^\d{10,15}$/.test(complianceOfficerPhone)
    )
      return "Complete the designated compliance officer details.";
    if (
      !bankGuaranteeNumber ||
      !bankGuaranteeBank ||
      bankGuaranteeAmount < requiredBankGuarantee(declaredFleetSize) ||
      !bankGuaranteeValidUntil
    )
      return "Complete the bank guarantee security details.";
    if (requiredDocuments.some(({ type }) => !documents[type]))
      return "Upload all four mandatory documents.";
    return "";
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
    const validation = validate();
    if (validation) {
      setError(validation);
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
      toast.success("Application submitted", {
        description: application.applicationNumber,
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
      <aside className="hidden min-h-screen shrink-0 flex-col justify-between bg-primary p-10 text-primary-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[36%] xl:w-[34%] xl:p-12">
        <div>
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm opacity-70 transition hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portal
          </Link>
          <div className="mb-8 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent">
              <Zap className="h-6 w-6" />
            </span>
            <strong className="text-xl">GACP</strong>
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
                "Organisation details",
                "Tell us about the applicant and authorised contact.",
              ],
              [
                "2",
                "Mandatory documents",
                "Attach all four prescribed supporting records.",
              ],
              [
                "3",
                "Verify and submit",
                "Confirm your mobile number and enter the review queue.",
              ],
            ].map(([step, title, text]) => (
              <div key={step} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-xs font-bold">
                  {step}
                </span>
                <div>
                  <b className="text-sm">{title}</b>
                  <p className="mt-0.5 text-xs leading-relaxed opacity-55">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <p className="text-xs leading-relaxed opacity-70">
              Your application remains editable if the reviewing officer raises
              a deficiency.
            </p>
          </div>
          <p className="text-xs opacity-45">
            Transport Department · Government of NCT of Delhi
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-bold text-primary"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </span>
            GACP
          </Link>
          <Link to="/login" className="text-sm font-semibold text-primary">
            Sign in
          </Link>
        </header>
        <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 xl:py-12">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-accent">
                Licence application
              </p>
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                Register your organisation
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Account verification, document upload and application submission
                are completed in this regulated workflow.
              </p>
            </div>
            <Link
              to="/login"
              className="hidden rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-muted lg:block"
            >
              Already registered? Sign in
            </Link>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[1.08fr_.92fr]">
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
              <div>
                <Label>Company name</Label>
                <Input
                  className="mt-1.5"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Registered organisation name"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Organisation type</Label>
                  <select
                    className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                <div>
                  <Label>CIN / registration number</Label>
                  <Input
                    className="mt-1.5"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="Registration number"
                  />
                </div>
              </div>
              <div>
                <Label>Registered address</Label>
                <Input
                  className="mt-1.5"
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  placeholder="Registered office address"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Contact person</Label>
                  <Input
                    className="mt-1.5"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Authorised contact"
                  />
                </div>
                <div>
                  <Label>Mobile number</Label>
                  <Input
                    className="mt-1.5"
                    value={contactPhone}
                    onChange={(e) =>
                      setContactPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10 to 15 digits"
                    maxLength={15}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Email address</Label>
                  <Input
                    className="mt-1.5"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@company.in"
                  />
                </div>
                <div>
                  <Label>Declared fleet size</Label>
                  <Input
                    className="mt-1.5"
                    type="number"
                    min={26}
                    value={declaredFleetSize}
                    onChange={(e) =>
                      setDeclaredFleetSize(Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Vehicle categories</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {["2W", "3W", "4W"].map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${categories.includes(category) ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-background text-muted-foreground hover:border-primary/40"}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t pt-5">
                <h4 className="font-semibold">
                  NCR office and compliance officer
                </h4>
                <p className="mb-3 text-xs text-muted-foreground">
                  A corporate or branch office in NCR and a designated
                  compliance officer are mandatory.
                </p>
                <Input
                  value={branchOfficeAddress}
                  onChange={(e) => setBranchOfficeAddress(e.target.value)}
                  placeholder="Corporate / branch office address within NCR"
                />
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={officeInNcr}
                    onChange={(e) => setOfficeInNcr(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I confirm this office is located within the National Capital
                    Region.
                  </span>
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Input
                    value={complianceOfficerName}
                    onChange={(e) => setComplianceOfficerName(e.target.value)}
                    placeholder="Compliance officer name"
                  />
                  <Input
                    value={complianceOfficerDesignation}
                    onChange={(e) =>
                      setComplianceOfficerDesignation(e.target.value)
                    }
                    placeholder="Designation"
                  />
                  <Input
                    value={complianceOfficerPhone}
                    onChange={(e) =>
                      setComplianceOfficerPhone(
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder="Officer mobile number"
                  />
                  <Input
                    type="email"
                    value={complianceOfficerEmail}
                    onChange={(e) => setComplianceOfficerEmail(e.target.value)}
                    placeholder="Officer email"
                  />
                </div>
              </div>
              <div className="border-t pt-5">
                <h4 className="font-semibold">
                  Bank guarantee as security deposit
                </h4>
                <p className="mb-3 text-xs text-muted-foreground">
                  Beneficiary: {bankGuaranteeBeneficiary}
                </p>
                <p className="mb-3 rounded-lg bg-primary/5 p-2 text-xs font-medium text-primary">
                  Required for {declaredFleetSize.toLocaleString("en-IN")} vehicles: ₹{requiredBankGuarantee(declaredFleetSize).toLocaleString("en-IN")}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={bankGuaranteeNumber}
                    onChange={(e) =>
                      setBankGuaranteeNumber(e.target.value.toUpperCase())
                    }
                    placeholder="Guarantee number"
                  />
                  <Input
                    value={bankGuaranteeBank}
                    onChange={(e) => setBankGuaranteeBank(e.target.value)}
                    placeholder="Issuing bank"
                  />
                  <Input
                    type="number"
                    min={requiredBankGuarantee(declaredFleetSize)}
                    step="0.01"
                    value={bankGuaranteeAmount || ""}
                    onChange={(e) =>
                      setBankGuaranteeAmount(Number(e.target.value))
                    }
                    placeholder="Guarantee amount (INR)"
                  />
                  <Input
                    type="date"
                    min={new Date(Date.now() + 86400000)
                      .toISOString()
                      .slice(0, 10)}
                    value={bankGuaranteeValidUntil}
                    onChange={(e) => setBankGuaranteeValidUntil(e.target.value)}
                  />
                </div>
              </div>
            </section>

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
                      PDF, PNG or JPEG
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {uploadedCount}/4
                </span>
              </div>
              {requiredDocuments.map(({ type, label }) => {
                const file = documents[type];
                return (
                  <label
                    key={type}
                    className={`block cursor-pointer rounded-xl border p-4 transition ${file ? "border-emerald-500/40 bg-emerald-50" : "bg-background hover:border-primary/40 hover:bg-primary/[.02]"}`}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${file ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}
                      >
                        {file ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <b className="block text-sm">{label}</b>
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
                );
              })}
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
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              <Button
                variant="accent"
                size="lg"
                className="w-full gap-2"
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
                provided are accurate.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
