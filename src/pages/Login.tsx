import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/lib/mockData';
import { Zap, ArrowLeft, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs: { label: string; role: UserRole; desc: string }[] = [
  { label: 'Aggregator / DSP', role: 'aggregator', desc: 'Licensed aggregators and delivery service providers' },
  { label: 'Government Officer', role: 'officer', desc: 'Transport department officials' },
  { label: 'Law Enforcement', role: 'enforcement', desc: 'Enforcement wing personnel' },
];

export default function Login() {
  const [activeTab, setActiveTab] = useState<UserRole>('aggregator');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = () => {
    setError(null);
    if (phone.length === 10) {
      setOtpSent(true);
    } else {
      setError('Please enter a valid 10-digit mobile number.');
    }
  };

  const handleVerify = async () => {
    setError(null);
    if (otp.length >= 4) {
      try {
        await login(phone, activeTab);
        navigate(activeTab === 'officer' || activeTab === 'enforcement' ? '/admin' : '/dashboard');
      } catch {
        setError('Unable to sign in. Check your number and try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
        <div className="grain absolute inset-0" />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-heading font-bold text-lg">GACP</p>
              <p className="text-xs text-primary-foreground/50">Government Aggregator Compliance Portal</p>
            </div>
          </div>
          <h2 className="font-heading text-3xl font-bold leading-snug">
            Delhi's journey to
            <span className="text-accent"> 100% electric</span> mobility starts here.
          </h2>
          <p className="mt-4 text-sm text-primary-foreground/50 max-w-md leading-relaxed">
            Mandatory 100% EV compliance for all licensed aggregators by April 1, 2030.
            Sign in to track your progress.
          </p>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/30">
          Transport Department · Govt of NCT of Delhi
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold">Sign in to GACP</h1>
              <p className="text-sm text-muted-foreground mt-1">Select your role and verify via OTP</p>
            </div>
            <Link to="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              New user? <span className="text-accent">Register</span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-8">
            {tabs.map((t) => (
              <button
                key={t.role}
                onClick={() => {
                  setActiveTab(t.role);
                  setOtpSent(false);
                  setOtp('');
                  setError(null);
                }}
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all",
                  activeTab === t.role
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            {tabs.find((t) => t.role === activeTab)?.desc}
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mobile Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-secondary rounded-lg text-sm text-muted-foreground">+91</div>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className="flex-1"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {!otpSent ? (
              <Button variant="accent" className="w-full gap-2" onClick={handleSendOTP}>
                <Smartphone className="w-4 h-4" /> Send OTP
              </Button>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Enter OTP</label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Demo: enter any 4+ digit code</p>
                </div>
                <Button variant="accent" className="w-full" onClick={handleVerify} disabled={otp.length < 4}>
                  Verify & Sign In
                </Button>
              </>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-8 leading-relaxed">
            By signing in, you agree to the Terms of Service of the Transport Department, Govt of NCT of Delhi.
            This is a secure government portal.
          </p>
        </div>
      </div>
    </div>
  );
}
