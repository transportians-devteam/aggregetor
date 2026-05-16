import { DashboardLayout } from '@/components/DashboardLayout';
import { Upload, FileSpreadsheet, Check, X, AlertTriangle, Car, Users, Search, Zap, ShieldAlert, ChevronRight, ChevronLeft, Loader2, Download, CreditCard, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { onboardVehicle } from '@/services/vehicleService';
import { onboardDriver, getMyDrivers } from '@/services/driverService';
import { useQuery } from '@tanstack/react-query';
import { getMyWallet, deductWallet } from '@/services/walletService';

/* ──────────── Mock Data ──────────── */
const categorySummary = [
  { label: '2W-Electric', count: 3, color: 'bg-green-100 text-green-700 border-green-200' },
  { label: '3W-CNG', count: 29, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: '4W-CNG', count: 18, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: '4W-Electric', count: 61, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

const validVehicles = [
  { sno: 29, reg: 'DL01AB2934', vClass: 'Passenger', cat: '3W', fuel: 'CNG', maker: 'BAJAJ AUTO LTD', model: 'BAJAJ RE CNG 4S FI', insurance: 'ACTIVE', pucc: 'ACTIVE', licAmt: 20, disc: 0, total: 20 },
  { sno: 30, reg: 'DL02CD3050', vClass: 'Passenger', cat: '3W', fuel: 'CNG', maker: 'BAJAJ AUTO LTD', model: 'BAJAJ RE CNG 4S FI', insurance: 'ACTIVE', pucc: 'ACTIVE', licAmt: 20, disc: 10, total: 10 },
  { sno: 31, reg: 'DL03EF3178', vClass: 'Passenger', cat: '3W', fuel: 'CNG', maker: 'BAJAJ AUTO LTD', model: 'BAJAJ RE CNG 4S FI', insurance: 'ACTIVE', pucc: 'ACTIVE', licAmt: 20, disc: 10, total: 10 },
  { sno: 32, reg: 'DL04GH3200', vClass: 'Passenger', cat: '4W', fuel: 'CNG', maker: 'MARUTI SUZUKI INDIA LTD', model: 'MARUTI WAGON R GREEN LXI', insurance: 'ACTIVE', pucc: 'ACTIVE', licAmt: 30, disc: 0, total: 30 },
  { sno: 33, reg: 'DL05IJ3345', vClass: 'Passenger', cat: '3W', fuel: 'CNG', maker: 'BAJAJ AUTO LTD', model: 'BAJAJ RE CNG 4S FI', insurance: 'ACTIVE', pucc: 'ACTIVE', licAmt: 20, disc: 10, total: 10 },
  { sno: 34, reg: 'DL06KL3490', vClass: 'Passenger', cat: '3W', fuel: 'CNG', maker: 'BAJAJ AUTO LTD', model: 'BAJAJ 3 WHEELER(AUTORICKSHAW)', insurance: 'ACTIVE', pucc: 'ACTIVE', licAmt: 20, disc: 0, total: 20 },
  { sno: 35, reg: 'DL07MN3567', vClass: 'Passenger', cat: '4W', fuel: 'CNG', maker: 'MARUTI SUZUKI INDIA LTD', model: 'TOUR S CNG', insurance: 'ACTIVE', pucc: 'ACTIVE', licAmt: 30, disc: 0, total: 30 },
];

const invalidVehicles = [
  { sno: 1, reg: 'DL48V1848', reason: 'ONLY ELECTRIC 2W VEHICLE ALLOWED' },
  { sno: 2, reg: 'DL45B4589', reason: 'ONLY ELECTRIC 2W VEHICLE ALLOWED' },
  { sno: 3, reg: 'DL55B0510', reason: 'ONLY ELECTRIC 2W VEHICLE ALLOWED' },
  { sno: 4, reg: 'DL18E3891', reason: 'ONLY ELECTRIC 2W VEHICLE ALLOWED' },
  { sno: 5, reg: 'DL35Y7859', reason: 'ONLY ELECTRIC 2W VEHICLE ALLOWED' },
  { sno: 6, reg: 'DL85CM9867', reason: 'ONLY ELECTRIC 2W VEHICLE ALLOWED' },
  { sno: 9, reg: 'DL9AK3602', reason: 'INSURANCE NOT VALID' },
  { sno: 10, reg: 'DL3A87838', reason: 'GOODS VEHICLE NOT ALLOWED' },
  { sno: 11, reg: 'DL2ZA8914', reason: 'FUEL TYPE NOT VALID' },
];

const paymentSummary = [
  { sno: 1, cat: '2W', vClass: 'Passenger', fuel: 'Electric', count: 3, amount: 0 },
  { sno: 2, cat: '3W', vClass: 'Passenger', fuel: 'CNG', count: 9, amount: 180 },
  { sno: 3, cat: '4W', vClass: 'Passenger', fuel: 'CNG', count: 5, amount: 150 },
  { sno: 4, cat: '4W', vClass: 'Passenger', fuel: 'Electric', count: 10, amount: 0 },
];

const uploadedFiles = [
  { name: 'aggregator_onboard_1705593584030.csv', date: '18 Jan 2024, 09:29 PM', status: 'Processed' },
];

const driverData = [
  { sno: 1, name: 'Rajesh Kumar', dl: 'DL-0420110012345', vehicle: 'DL01AB2934', expiry: '2028-03-10', psv: true, status: 'verified' },
  { sno: 2, name: 'Amit Singh', dl: 'DL-0520130054321', vehicle: 'DL02CD3050', expiry: '2025-11-20', psv: false, status: 'pending' },
  { sno: 3, name: 'Sunil Verma', dl: 'DL-0620140098765', vehicle: 'DL03EF3178', expiry: '2027-01-15', psv: true, status: 'verified' },
  { sno: 4, name: 'Mohan Das', dl: 'DL-0720150011223', vehicle: 'DL04GH3200', expiry: '2026-08-05', psv: true, status: 'verified' },
];

/* ──────────── Modals & Overlays ──────────── */
function ProcessingOverlay({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setProgress(p => {
      if (p >= 100) { clearInterval(iv); setTimeout(onDone, 400); return 100; }
      return p + Math.random() * 12;
    }), 200);
    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-2xl p-10 shadow-2xl w-full max-w-md text-center border border-border">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{Math.min(Math.round(progress), 100)}%</span>
          </div>
        </div>
        <h3 className="font-heading font-bold text-lg mb-2">Processing Vehicles</h3>
        <p className="text-sm text-muted-foreground mb-6">Validating via VAHAN API — checking RC, Insurance, PUCC…</p>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-200" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{Math.min(Math.round(progress), 100) < 100 ? 'Please wait, do not close this window…' : 'Done! Preparing results…'}</p>
      </div>
    </div>
  );
}

function CategoryModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl p-6 shadow-2xl w-full max-w-lg border border-border relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-heading font-bold text-xl mb-4">Fleet by Category</h3>
        <div className="grid grid-cols-2 gap-4">
          {categorySummary.map(c => (
            <div key={c.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm ${c.color}`}>
              <Car className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{c.label}</span>
              <span className="font-bold text-lg">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────── Main Component ──────────── */
export default function Onboarding() {
  const [mainTab, setMainTab] = useState<'vehicle' | 'dl'>('vehicle');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [processing, setProcessing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [resultTab, setResultTab] = useState<'valid' | 'invalid'>('valid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dlNumber, setDlNumber] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [isSubmittingDl, setIsSubmittingDl] = useState(false);

  const { data: driversData = [], refetch: refetchDrivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: getMyDrivers,
    enabled: mainTab === 'dl'
  });

  const totalAmount = paymentSummary.reduce((s, r) => s + r.amount, 0);
  
  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: getMyWallet
  });
  const walletBalance = walletData?.balance || 0;

  const handleUpload = () => { setProcessing(true); };

  const handleAddDl = async () => {
    if (!dlNumber || !vehicleReg) {
      toast.error('Please enter DL number and select a vehicle');
      return;
    }
    setIsSubmittingDl(true);
    try {
      await onboardDriver({
        name: 'Mock Driver Name',
        dlNumber: dlNumber,
        vehicleRegistration: vehicleReg,
        dlExpiry: '2028-01-01',
        psvBadge: true
      });
      toast.success('Driver onboarded and linked successfully!');
      setDlNumber('');
      setVehicleReg('');
      refetchDrivers();
    } catch (error) {
      toast.error('Failed to link driver. Might already exist.');
    } finally {
      setIsSubmittingDl(false);
    }
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(
        validVehicles.map((v) =>
          onboardVehicle({
            registrationNumber: v.reg,
            vehicleClass: v.vClass,
            category: v.cat,
            fuelType: v.fuel,
            maker: v.maker,
            model: v.model,
          })
        )
      );
      await deductWallet(totalAmount, `Onboarded ${validVehicles.length} Vehicles`);
      
      toast.success('Vehicles Onboarded and Wallet Deducted successfully!');
      refetchWallet();
      setTimeout(() => {
        setStep(1);
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to onboard some vehicles. They may already exist.');
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {processing && <ProcessingOverlay onDone={() => { setProcessing(false); setStep(2); }} />}
      {showCategoryModal && <CategoryModal onClose={() => setShowCategoryModal(false)} />}

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Onboarding</h1>
            <p className="text-sm text-muted-foreground mt-1">Add vehicles and drivers to your fleet</p>
          </div>
        </div>

        {/* Fleet Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Fleet</p>
                <Car className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">1,240</p>
              <p className="text-[10px] text-muted-foreground mt-1 mb-3"><span className="text-green-600 font-medium">+12</span> this week</p>
            </div>
            <button onClick={() => setShowCategoryModal(true)} className="flex items-center text-xs font-semibold text-primary hover:underline w-fit">
              View Categories <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
          <div className="glass rounded-xl p-5 border border-border">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">EV Adoption</p>
              <Zap className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-heading font-bold text-green-600">45%</p>
            <div className="w-full bg-muted rounded-full h-1 mt-2 mb-1"><div className="bg-green-600 h-1 rounded-full w-[45%]"></div></div>
            <p className="text-[10px] text-muted-foreground">Target: 50% by Year 3</p>
          </div>
          <div className="glass rounded-xl p-5 border border-border">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Drivers</p>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">1,180</p>
            <p className="text-[10px] text-muted-foreground mt-1"><span className="text-blue-600 font-medium">95%</span> matched to fleet</p>
          </div>
          <div className="glass rounded-xl p-5 border border-amber-200/50 bg-amber-50/10">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">Pending Action</p>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-heading font-bold text-amber-600">14</p>
            <p className="text-[10px] text-amber-600 mt-1">Approvals required</p>
          </div>
        </div>

        {/* Main Tabs: Vehicles | Driving Licence */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button onClick={() => { setMainTab('vehicle'); setStep(1); }} className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${mainTab === 'vehicle' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Car className="w-4 h-4" />Vehicles
          </button>
          <button onClick={() => setMainTab('dl')} className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${mainTab === 'dl' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <FileText className="w-4 h-4" />Driving Licence
          </button>
        </div>

        {/* ═══════════════ VEHICLE TAB ═══════════════ */}
        {mainTab === 'vehicle' && (
          <>
            {/* Step Progress Bar */}
            <div className="flex items-center gap-2">
              {[
                { n: 1, label: 'Upload' },
                { n: 2, label: 'Review' },
                { n: 3, label: 'Summary' },
                { n: 4, label: 'Payment' },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${step >= s.n ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`} onClick={() => { if (s.n <= step) setStep(s.n as 1|2|3|4); }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${step >= s.n ? 'border-primary-foreground/30 bg-primary-foreground/20' : 'border-border bg-background'}`}>{step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}</div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </div>
              ))}
            </div>

            {/* ──── STEP 1: Upload ──── */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Category chips */}
                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categorySummary.map(c => (
                    <div key={c.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm ${c.color}`}>
                      <Car className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{c.label}</span>
                      <span className="font-bold text-lg">{c.count}</span>
                    </div>
                  ))}
                </div> */}

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Upload CSV */}
                  <div className="glass rounded-xl border border-border p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-heading font-semibold">Upload CSV</h3>
                      <button className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"><Download className="w-3 h-3" />Download Sample</button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Upload csv files here</p>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20 hover:border-primary/40 transition-colors cursor-pointer group">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                      <p className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">SELECT FILE</p>
                      <p className="text-[10px] text-muted-foreground">CSV format only · Max 500 rows</p>
                    </div>
                    <Button className="w-full mt-4" onClick={handleUpload}><Upload className="w-4 h-4 mr-2" />Upload</Button>
                  </div>

                  {/* Uploaded CSV list */}
                  <div className="glass rounded-xl border border-border p-6">
                    <h3 className="font-heading font-semibold mb-4">Uploaded CSV</h3>
                    {uploadedFiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No files uploaded yet</p>
                    ) : (
                      <div className="space-y-3">
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><FileSpreadsheet className="w-5 h-5 text-green-600" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{f.name}</p>
                              <p className="text-xs text-muted-foreground">{f.date}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 text-xs font-semibold">
                              <button className="text-destructive hover:underline">Delete</button>
                              <span className="text-green-600">{f.status}</span>
                              <button className="text-primary hover:underline">View Records</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpload} className="px-6"><span>Next</span><ChevronRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </div>
            )}

            {/* ──── STEP 2: Review (Valid / Invalid Tabs) ──── */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Sub-tabs */}
                <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
                  <button onClick={() => setResultTab('valid')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${resultTab === 'valid' ? 'bg-background shadow text-green-700' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Check className="w-4 h-4" />Eligible Vehicles <span className="ml-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">{validVehicles.length}</span>
                  </button>
                  <button onClick={() => setResultTab('invalid')} className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${resultTab === 'invalid' ? 'bg-background shadow text-red-600' : 'text-muted-foreground hover:text-foreground'}`}>
                    <X className="w-4 h-4" />Not Eligible <span className="ml-1 px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-bold">{invalidVehicles.length}</span>
                  </button>
                </div>

                {resultTab === 'valid' ? (
                  <div className="glass rounded-xl overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-muted/30 text-left">
                          <th className="p-3 font-medium text-muted-foreground">S.No</th>
                          <th className="p-3 font-medium text-muted-foreground">Vehicle No</th>
                          <th className="p-3 font-medium text-muted-foreground">Vehicle Class</th>
                          <th className="p-3 font-medium text-muted-foreground">Category</th>
                          <th className="p-3 font-medium text-muted-foreground">Fuel Type</th>
                          <th className="p-3 font-medium text-muted-foreground">Manufacturer</th>
                          <th className="p-3 font-medium text-muted-foreground">Model</th>
                          <th className="p-3 font-medium text-muted-foreground">Insurance</th>
                          <th className="p-3 font-medium text-muted-foreground">PUCC</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">License Amt</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Discount</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Total</th>
                        </tr></thead>
                        <tbody>
                          {validVehicles.map(v => (
                            <tr key={v.sno} className="border-b border-border last:border-0 hover:bg-muted/20">
                              <td className="p-3 text-muted-foreground">{v.sno}</td>
                              <td className="p-3 font-mono font-medium">{v.reg}</td>
                              <td className="p-3">{v.vClass}</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{v.cat}</span></td>
                              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v.fuel === 'Electric' || v.fuel === 'EV' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{v.fuel}</span></td>
                              <td className="p-3 text-xs">{v.maker}</td>
                              <td className="p-3 text-xs">{v.model}</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{v.insurance}</span></td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{v.pucc}</span></td>
                              <td className="p-3 text-right font-medium">{v.licAmt.toFixed(2)}</td>
                              <td className="p-3 text-right text-green-600 font-medium">{v.disc.toFixed(2)}</td>
                              <td className="p-3 text-right font-bold text-primary">{v.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="glass rounded-xl overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-border bg-muted/30 text-left">
                          <th className="p-3 font-medium text-muted-foreground">S.No</th>
                          <th className="p-3 font-medium text-muted-foreground">Vehicle No</th>
                          <th className="p-3 font-medium text-muted-foreground">Reason</th>
                        </tr></thead>
                        <tbody>
                          {invalidVehicles.map(v => (
                            <tr key={v.sno} className="border-b border-border last:border-0 bg-red-50/30 hover:bg-red-50/60">
                              <td className="p-3 text-muted-foreground">{v.sno}</td>
                              <td className="p-3 font-mono font-medium text-muted-foreground">{v.reg}</td>
                              <td className="p-3"><span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">{v.reason}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-1" />Prev</Button>
                  <Button onClick={() => setStep(3)}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* ──── STEP 3: Summary / Payment Preview ──── */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="glass rounded-xl border border-border p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-heading font-bold">Total Amount: <span className="text-primary">₹{totalAmount}</span></h2>
                    <p className="text-sm text-primary/70 mt-0.5">Wallet Amount : ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border bg-muted/30 text-left">
                        <th className="p-3 font-medium text-muted-foreground">S.No.</th>
                        <th className="p-3 font-medium text-muted-foreground">Vehicle Category</th>
                        <th className="p-3 font-medium text-muted-foreground">Vehicle Class</th>
                        <th className="p-3 font-medium text-muted-foreground">Fuel Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Count</th>
                        <th className="p-3 font-medium text-muted-foreground text-right">Amount</th>
                      </tr></thead>
                      <tbody>
                        {paymentSummary.map(r => (
                          <tr key={r.sno} className="border-b border-border last:border-0 hover:bg-muted/20">
                            <td className="p-3 text-primary font-medium">{r.sno}</td>
                            <td className="p-3 font-medium">{r.cat}</td>
                            <td className="p-3 text-muted-foreground">{r.vClass}</td>
                            <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.fuel === 'Electric' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.fuel}</span></td>
                            <td className="p-3 font-semibold">{r.count}</td>
                            <td className="p-3 text-right font-bold">{r.amount === 0 ? <span className="text-green-600">₹ 0</span> : <span className="text-primary">₹ {r.amount}</span>}</td>
                          </tr>
                        ))}
                        <tr className="bg-muted/40 font-bold">
                          <td colSpan={4} className="p-3"></td>
                          <td className="p-3">Total</td>
                          <td className="p-3 text-right text-primary text-lg">₹{totalAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-1" />Prev</Button>
                  <Button onClick={() => setStep(4)}>Submit<ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            )}

            {/* ──── STEP 4: Payment ──── */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="glass rounded-xl border border-border p-8 max-w-lg mx-auto text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"><CreditCard className="w-8 h-8 text-primary" /></div>
                  <h2 className="font-heading font-bold text-xl mb-1">Complete Payment</h2>
                  <p className="text-sm text-muted-foreground mb-6">Deduct onboarding fee from your wallet</p>

                  <div className="bg-muted/30 rounded-xl p-5 mb-6 space-y-3 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Eligible Vehicles</span>
                      <span className="font-semibold">{validVehicles.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-bold text-primary">₹{totalAmount}</span>
                    </div>
                    <div className="border-t border-border my-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wallet Balance</span>
                      <span className="font-semibold text-green-600">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">After Payment</span>
                      <span className="font-semibold">₹{(walletBalance - totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handlePayment} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    {isSubmitting ? 'Processing...' : `Pay ₹${totalAmount} from Wallet`}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">Amount will be debited from your GACP wallet</p>
                </div>

                <div className="flex justify-start">
                  <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-1" />Back to Summary</Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════ DRIVING LICENCE TAB ═══════════════ */}
        {mainTab === 'dl' && (
          <div className="space-y-6">
            {/* Info banner */}
            <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Import Driving Licences for validated vehicles</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upload the DL details for the vehicles you just onboarded. The system will auto-match DLs to validated vehicle registrations.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upload DL CSV */}
              <div className="glass rounded-xl border border-border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-semibold">Upload DL CSV</h3>
                  <button className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"><Download className="w-3 h-3" />Download Template</button>
                </div>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20 hover:border-primary/40 transition-colors cursor-pointer group">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                  <p className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">SELECT FILE</p>
                  <p className="text-[10px] text-muted-foreground">CSV: name, dl_number, vehicle_reg</p>
                </div>
                <Button className="w-full mt-4"><Upload className="w-4 h-4 mr-2" />Upload & Verify via SARATHI</Button>
              </div>

              {/* Quick Add Single */}
              <div className="glass rounded-xl border border-border p-6">
                <h3 className="font-heading font-semibold mb-4">Add Single DL</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">DL Number</label>
                    <input type="text" placeholder="DL-0420110012345" value={dlNumber} onChange={e => setDlNumber(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/30 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Link to Vehicle</label>
                    <select value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background">
                      <option value="">Select validated vehicle…</option>
                      {validVehicles.map(v => <option key={v.reg} value={v.reg}>{v.reg} — {v.model}</option>)}
                    </select>
                  </div>
                  <Button className="w-full" onClick={handleAddDl} disabled={isSubmittingDl}>
                    {isSubmittingDl ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isSubmittingDl ? 'Verifying...' : 'Verify & Link'}
                  </Button>
                </div>
              </div>
            </div>

            {/* DL Results Table */}
            <div className="glass rounded-xl overflow-hidden border border-border">
              <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                <h3 className="font-heading font-semibold text-sm">Linked Driving Licences</h3>
                <span className="text-xs text-muted-foreground">{driversData.length} drivers linked</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium text-muted-foreground">S.No</th>
                    <th className="p-3 font-medium text-muted-foreground">Driver Name</th>
                    <th className="p-3 font-medium text-muted-foreground">DL Number</th>
                    <th className="p-3 font-medium text-muted-foreground">Linked Vehicle</th>
                    <th className="p-3 font-medium text-muted-foreground">DL Expiry</th>
                    <th className="p-3 font-medium text-muted-foreground">PSV Badge</th>
                    <th className="p-3 font-medium text-muted-foreground">Status</th>
                  </tr></thead>
                  <tbody>
                    {driversData.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No drivers linked yet.</td></tr>
                    ) : (
                      driversData.map((d, i) => (
                        <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3 font-medium">{d.name}</td>
                          <td className="p-3 font-mono text-xs">{d.dlNumber}</td>
                          <td className="p-3 font-mono text-xs text-primary">{d.vehicleRegistration}</td>
                          <td className="p-3 text-muted-foreground">{d.dlExpiry || 'N/A'}</td>
                          <td className="p-3">{d.psvBadge ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{d.status === 'ACTIVE' ? 'Verified' : 'Pending'}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
