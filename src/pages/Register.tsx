import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf, Building2, FileUp, Truck, ClipboardCheck, ArrowLeft, ArrowRight, Check, Zap, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/services/api';

const REGISTRATION_PROCESS = [
  { id: 1, title: 'Eligibility Check' },
  { id: 2, title: 'Document Preparation' },
  { id: 3, title: 'Portal Registration', active: true },
  { id: 4, title: 'Application Submission' },
  { id: 5, title: 'DC Verification' },
  { id: 6, title: 'SCoT EV Approval' },
  { id: 7, title: '(Appellate if needed)', optional: true },
  { id: 8, title: 'License Granted (5 yrs)' },
  { id: 9, title: 'Start Operations' },
];

const STEPS = [
  { label: 'Details', icon: Building2 },
  { label: 'Docs', icon: FileUp },
  { label: 'Fleet', icon: Truck },
  { label: 'Review', icon: ClipboardCheck },
];

const VEHICLE_CATEGORIES = ['2W', '3W-Passenger', '3W-LCV', '4W-Passenger', '4W-Carrier'] as const;

const DOCUMENTS = [
  { key: 'coi', label: 'Certificate of Incorporation', required: true },
  { key: 'pan', label: 'PAN Card', required: true },
  { key: 'gst', label: 'GST Certificate', required: true },
  { key: 'insurance', label: 'Fleet Insurance Policy', required: true },
  { key: 'address', label: 'Proof of Registered Address', required: true },
] as const;

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 1: Company Details
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState<'Aggregator' | 'DSP'>('Aggregator');
  const [cin, setCin] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 2: Documents (simulate file selection)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});

  // Step 3: Vehicle Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 4: Agreement
  const [agreed, setAgreed] = useState(false);

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, 3)); };
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const canProceed = () => {
    if (step === 0) return companyName.trim() && cin.trim() && contactName.trim() && contactEmail.trim() && contactPhone.trim();
    if (step === 1) return DOCUMENTS.filter(d => d.required).every(d => uploadedDocs[d.key]);
    if (step === 2) return selectedCategories.length > 0;
    if (step === 3) return agreed;
    return false;
  };

  const simulateUpload = (key: string) => {
    setUploadedDocs(prev => ({ ...prev, [key]: `${key}_document.pdf` }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        companyName,
        companyType,
        cin,
        regAddress,
        contactName,
        contactPhone,
        contactEmail,
        categories: selectedCategories
      });
      toast.success('Application submitted successfully!', {
        description: 'Your license application has been sent for review. Please wait for DC Verification.',
      });
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      toast.error('Registration failed', {
        description: 'There was an error submitting your application. Please check your details and try again.',
      });
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel (similar to Login.tsx but showing Process Flow) */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary text-primary-foreground p-12 flex-col relative overflow-hidden h-screen overflow-y-auto no-scrollbar">
        <div className="grain absolute inset-0 pointer-events-none" />
        
        <div className="relative z-10 flex-1 flex flex-col">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors mb-12 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-heading font-bold text-lg leading-tight">GACP</p>
              <p className="text-[10px] text-primary-foreground/70 uppercase tracking-widest">Registration</p>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="font-heading text-3xl font-bold leading-snug">
              Licensing Process Flow
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/60 max-w-sm leading-relaxed">
              Understand the end-to-end journey from application to final license grant under the Delhi Motor Vehicle Aggregator Scheme.
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative flex-1 pl-4 border-l border-primary-foreground/20 space-y-8 ml-2 mb-12">
            {REGISTRATION_PROCESS.map((proc, idx) => {
              const isActive = proc.active;
              const isPast = REGISTRATION_PROCESS.findIndex(p => p.active) > idx;
              
              return (
                <div key={proc.id} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full outline outline-4 outline-primary ${
                    isActive ? 'bg-accent shadow-[0_0_12px_rgba(var(--accent),0.6)]' :
                    isPast ? 'bg-primary-foreground/60' : 'bg-primary-foreground/20'
                  }`} />
                  
                  <div className={`-mt-1 ${isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-40'}`}>
                    <h3 className={`font-semibold text-sm flex items-center gap-2 ${isActive ? 'text-accent text-base' : ''}`}>
                      {proc.title}
                      {proc.optional && <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full border border-current text-inherit opacity-70">Optional</span>}
                      {isActive && <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">YOU ARE HERE</span>}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-primary-foreground/30 mt-auto">
            Transport Department · Govt of NCT of Delhi
          </p>
        </div>
      </div>

      {/* Right panel (Interactive Form) */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar">
        {/* Mobile Header Toolbar */}
        <div className="lg:hidden p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-heading font-bold">GACP</span>
          </div>
          <Link to="/" className="text-sm font-medium hover:text-accent">Home</Link>
        </div>

        <div className="flex-1 flex flex-col px-6 py-8 md:px-16 md:py-12 max-w-3xl w-full mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold">Portal Registration</h1>
              <p className="text-sm text-muted-foreground mt-1">Complete the steps to submit your application.</p>
            </div>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Have an account? <span className="text-accent">Login</span>
            </Link>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-10 gap-1 bg-secondary/50 p-2 rounded-xl">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={s.label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isDone ? 'bg-accent text-accent-foreground shadow-sm' : isActive ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground'
                    }`}>
                      {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-xs font-semibold hidden md:block ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 md:mx-4 rounded-full transition-colors ${
                      i < step ? 'bg-accent/50' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full"
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <Label>Company / Firm Name *</Label>
                        <Input placeholder="e.g. Ola Electric Fleet Pvt. Ltd." value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>License Category *</Label>
                        <div className="flex gap-2 mt-1.5 p-1 bg-secondary rounded-lg">
                          {(['Aggregator', 'DSP'] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => setCompanyType(type)}
                              className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                                companyType === type
                                  ? 'bg-card shadow-sm text-foreground'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {type === 'DSP' ? 'Delivery SP' : type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>CIN / Registration No. *</Label>
                        <Input placeholder="U74999DL2023PTC..." value={cin} onChange={e => setCin(e.target.value)} className="mt-1.5" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Registered Office Address in Delhi</Label>
                        <Input placeholder="Full localized address" value={regAddress} onChange={e => setRegAddress(e.target.value)} className="mt-1.5" />
                      </div>
                      <div className="sm:col-span-2 pt-2 border-t border-border mt-2">
                        <h3 className="font-heading font-semibold text-sm mb-4">Authorized Nodal Officer</h3>
                      </div>
                      <div>
                        <Label>Full Name *</Label>
                        <Input placeholder="Contact person name" value={contactName} onChange={e => setContactName(e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>Mobile Number *</Label>
                        <Input type="tel" placeholder="+91 98765 43210" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="mt-1.5" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Email Address *</Label>
                        <Input type="email" placeholder="contact@company.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="bg-secondary/50 p-4 rounded-xl flex gap-3 items-start mb-6">
                      <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Upload perfectly scanned, clear PDF copies (max 5 MB each). Ensure company name matches Registration/CIN exactly.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {DOCUMENTS.map(doc => {
                        const uploaded = !!uploadedDocs[doc.key];
                        return (
                          <div key={doc.key} className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                            uploaded ? 'bg-accent/5 border-accent/40 shadow-sm' : 'bg-card border-border hover:border-accent/40'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                uploaded ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                              }`}>
                                {uploaded ? <Check className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{doc.label} {doc.required && <span className="text-destructive">*</span>}</p>
                                {uploaded ? (
                                  <p className="text-[10px] text-accent mt-0.5">{uploadedDocs[doc.key]} • 1.2 MB</p>
                                ) : (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Pending upload</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={uploaded ? 'outline' : 'secondary'}
                              size="sm"
                              className={`shrink-0 text-xs font-semibold ${uploaded ? 'border-accent/30 text-accent hover:bg-accent/10' : ''}`}
                              onClick={() => simulateUpload(doc.key)}
                            >
                              {uploaded ? 'Replace' : 'Browse'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-6">Select all applicable vehicle categories you intend to onboard to your fleet. This anchors your EV adoption targets.</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {VEHICLE_CATEGORIES.map(cat => {
                        const selected = selectedCategories.includes(cat);
                        const labels: Record<string, string> = {
                          '2W': 'Two-Wheeler',
                          '3W-Passenger': 'Three-Wheeler (Passenger)',
                          '3W-LCV': 'Three-Wheeler (Light Commercial)',
                          '4W-Passenger': 'Four-Wheeler (Passenger)',
                          '4W-Carrier': 'Four-Wheeler (Goods Carrier)',
                        };
                        const evTargets: Record<string, string> = {
                          '2W': '100% EV from Day 1',
                          '3W-Passenger': '10% → 100% over 5 years',
                          '3W-LCV': '10% → 100% over 5 years',
                          '4W-Passenger': '5% → 100% over 5 years',
                          '4W-Carrier': '5% → 100% over 5 years',
                        };
                        
                        return (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`rounded-xl border p-4 text-left transition-all ${
                              selected
                                ? 'bg-primary border-primary shadow-md text-primary-foreground transform scale-[1.02]'
                                : 'bg-card border-border hover:border-primary/40 text-foreground'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-heading font-bold">{cat}</p>
                                <p className={`text-xs mt-0.5 ${selected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{labels[cat]}</p>
                              </div>
                              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                selected ? 'bg-accent border-accent text-accent-foreground' : 'border-muted-foreground/30'
                              }`}>
                                {selected && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                            <div className={`text-[11px] mt-4 flex items-center gap-1.5 px-2 py-1 rounded-md w-fit ${
                              selected ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-secondary text-muted-foreground'
                            }`}>
                              <Leaf className="h-3 w-3" /> {evTargets[cat]} Target
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 pb-8">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Company Info Box */}
                      <div className="rounded-xl border p-5 bg-card shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm">Company Summary</h3>
                        </div>
                        <div className="space-y-2.5 text-xs text-muted-foreground">
                          <p className="flex justify-between"><span className="opacity-70">Name</span> <span className="text-foreground font-medium truncate max-w-[120px]">{companyName}</span></p>
                          <p className="flex justify-between"><span className="opacity-70">Role</span> <span className="text-foreground font-medium">{companyType}</span></p>
                          <p className="flex justify-between"><span className="opacity-70">CIN</span> <span className="text-foreground font-medium truncate max-w-[120px]">{cin}</span></p>
                          <p className="flex justify-between"><span className="opacity-70">Nodal Officer</span> <span className="text-foreground font-medium truncate max-w-[120px]">{contactName}</span></p>
                          <p className="flex justify-between"><span className="opacity-70">Nodal Phone</span> <span className="text-foreground font-medium">{contactPhone}</span></p>
                        </div>
                      </div>

                      {/* Fleet Info Box */}
                      <div className="rounded-xl border p-5 bg-card shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm">Fleet Categories</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategories.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None selected</span>
                          ) : (
                            selectedCategories.map(cat => (
                              <span key={cat} className="text-[10px] font-bold px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/20">
                                {cat}
                              </span>
                            ))
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-4 mt-6">
                          <FileUp className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm">Documents Uploaded</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <Check className="text-accent w-4 h-4" />
                          {Object.keys(uploadedDocs).length} / {DOCUMENTS.length} uploaded
                        </div>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div className="bg-secondary/30 border border-border rounded-xl p-5 mt-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="agree"
                          checked={agreed}
                          onCheckedChange={(v) => setAgreed(v === true)}
                          className="mt-0.5 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                        <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer -mt-0.5">
                          I hereby declare that all information provided is true and correct, and I agree to abide by the terms of the <strong className="text-foreground font-semibold">Delhi Motor Vehicle Aggregator & Delivery Service Provider Scheme, 2023</strong> (Notification No. FDC/EV/TPT/2021/02/49957).
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-6 mt-auto flex items-center justify-between border-t border-border">
            <Button
              variant="outline"
              onClick={step === 0 ? () => navigate('/login') : goPrev}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Cancel' : 'Back'}
            </Button>

            {step < 3 ? (
              <Button variant="accent" onClick={goNext} disabled={!canProceed()} className="gap-2 px-8">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" onClick={handleSubmit} disabled={!agreed || isSubmitting} className="gap-2 px-8">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                {isSubmitting ? 'Submitting...' : 'Submit to Govt.'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
