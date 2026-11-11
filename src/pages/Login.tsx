import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { requestLoginOtp } from "@/services/authService";
import { getErrorMessage } from "@/services/api";
import { cn } from "@/lib/utils";

const roles: Array<{ label: string; role: UserRole; phone?: string; hint?: string }> = [
  { label: "Aggregator", role: "aggregator", hint: "Operator" },
  { label: "DSP", role: "dsp", hint: "Delivery Service" },
  { label: "DC Level Officer", role: "officer", phone: "9000000001", hint: "1. Scrutiny" },
  { label: "SCoT (EV) / Admin", role: "admin", phone: "9000000004", hint: "2. Licence Sign-off" },
  { label: "Appellate Authority", role: "appellate_officer", phone: "9000000002", hint: "Appeals" },
  { label: "Enforcement Officer", role: "enforcement", phone: "9000000003", hint: "Field Team" },
];

export default function Login() {
  const navigate = useNavigate();
  const { loginDevelopment, loginWithOtp } = useAuth();
  const [role, setRole] = useState<UserRole>("aggregator");
  const [phone, setPhone] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const destination = [
    "officer",
    "appellate_officer",
    "enforcement",
    "admin",
  ].includes(role)
    ? "/admin"
    : "/applications";

  const selectRole = (next: (typeof roles)[number]) => {
    setRole(next.role);
    setPhone(import.meta.env.DEV ? (next.phone ?? "") : "");
    setChallengeId(null);
    setOtp("");
    setError("");
  };

  const submit = async () => {
    if (!/^\d{10,15}$/.test(phone)) {
      setError("Enter a valid 10 to 15 digit mobile number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (import.meta.env.DEV) {
        await loginDevelopment(phone, role);
        navigate(destination);
      } else if (!challengeId) {
        const challenge = await requestLoginOtp(phone, role);
        setChallengeId(challenge.challengeId);
      } else {
        await loginWithOtp(challengeId, otp);
        navigate(destination);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to sign in."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm opacity-70 mb-12"
          >
            <ArrowLeft className="w-4 h-4" /> Back to portal
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2 backdrop-blur-sm border border-white/10">
              <img
                src="/delhi-sarkar.png"
                alt="Delhi Sarkar"
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </div>
            <div>
              <strong className="block text-xl leading-none">GACP</strong>
              <span className="text-[10px] opacity-70">Government of NCT of Delhi</span>
            </div>
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight">
            Secure access to Delhi's aggregator compliance portal.
          </h1>
          <p className="mt-4 opacity-70 max-w-md">
            Role-aware workflows for operators, reviewing officers, appellate
            authorities and enforcement teams.
          </p>
        </div>
        <p className="text-xs opacity-50">
          Transport Department · Government of NCT of Delhi
        </p>
      </aside>
      <main className="flex-1 grid place-items-center p-6">
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-start mb-7">
            <div>
              <h2 className="font-heading text-2xl font-bold">Sign in</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {import.meta.env.DEV
                  ? "Development access uses registered phone and role."
                  : "A six-digit OTP will be sent to your registered phone."}
              </p>
            </div>
            <Link to="/register" className="text-sm text-accent font-medium">
              Apply
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {roles.map((item) => (
              <button
                key={item.role}
                onClick={() => selectRole(item)}
                className={cn(
                  "p-2.5 rounded-lg border text-xs font-semibold text-center transition-colors flex flex-col justify-center items-center min-h-[54px]",
                  role === item.role
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border hover:bg-muted/50",
                )}
              >
                <span className="leading-tight">{item.label}</span>
                {item.hint && (
                  <span
                    className={cn(
                      "text-[10px] mt-0.5 font-normal",
                      role === item.role
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.hint}
                  </span>
                )}
              </button>
            ))}
          </div>
          <label className="text-xs font-medium text-muted-foreground">
            Mobile number
          </label>
          <Input
            className="mt-1.5"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value.replace(/\D/g, ""))
            }
            placeholder="10 to 15 digits"
            maxLength={15}
            disabled={Boolean(challengeId)}
          />
          {challengeId && (
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
                Six-digit OTP
              </label>
              <Input
                className="mt-1.5"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                placeholder="000000"
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          <Button
            variant="accent"
            className="w-full mt-5 gap-2"
            onClick={submit}
            disabled={busy || (Boolean(challengeId) && otp.length !== 6)}
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
            {import.meta.env.DEV
              ? "Sign in"
              : challengeId
                ? "Verify OTP"
                : "Send OTP"}
          </Button>
        </div>
      </main>
    </div>
  );
}
